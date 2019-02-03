
import * as socketIo from "socket.io";
import { Card, GameType, Score, Suit } from "../../../../shared/model";
import {Player} from "../../model";
import {State} from "./state";

export class Hand {

    protected numCards: number;
    protected currentPlayer = -1;
    protected trickLeader = -1;
    protected dealerIndex: number;
    protected currentTrick: Card[] = [];
    protected scores: Score[] = [];
    protected state: State;
    protected params: any;
    protected trumpSuit: Suit;
    protected defaultSortType: any;
    protected stateHandlers: Array<() => void> = []; // array of void functions

    // protected sleep = (ms) => { return new Promise(resolve => {setTimeout(resolve, ms)}) };

    constructor(protected players: Player[], protected deck: any, protected tableChan: SocketIO.Namespace) {
        this.numCards = 10;
        this.SetupListeners();
        this.SetupStateHandlers();
    }

    public Sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {setTimeout(resolve, ms); });
    }

    public async Play(dealerIndex: number, params: any): Promise<Score[]> {
        this.dealerIndex = dealerIndex;
        this.params = params;

        this.CollectCards();
        this.deck.shuffle();
        this.DealHands();
        this.SetInitialState();

        await this.AwaitResultAsync();
        return this.scores;
    }

    public SetInitialState() {
        this.SetState(State.Bid);
    }

    public SetState(state: State) {
        this.state = state;
        if (this.stateHandlers[state]) {
            this.stateHandlers[state](); // call associated event function
        }
    }

    public CollectCards() {
        for (const player of this.players) {
            this.ReturnToDeck(player.heldCards);
            this.ReturnToDeck(player.trickPile);
        }
    }

    public ReturnToDeck(cards: Card[]) {
        while (cards && cards.length > 0) {
            this.deck.cards.push(cards.pop());
        }
    }

    public DealHands() {
        for (const player of this.players) {
            console.log(`Dealing hand to player ${player.user.name} socket ${player.socket.id}`);
            const newHand = this.deck.draw(this.numCards);
            for (const card of newHand) {
                // TODO: add effective rank from GetSort here. Probably 'rank' is actual card and 'sort' is GetSort
                // second thought: check if we're using Description for rank, then just pass GetSort in card.sort
                player.heldCards.push({suit: card.suit, description: card.description, sort: card.sort});
            }

            this.SortCards(player.heldCards, this.defaultSortType);

            player.socket.emit("dealHand", player.heldCards);
            this.tableChan.emit("tableDealCards", {numCards: this.numCards, toUser: player.user.id});
        }
    }

    public SortCards(cards: Card[], sortType: Suit = this.trumpSuit) {
        const suits = Array.from(new Set(cards.map((card) => this.GetSuit(card, sortType)))); // gets distinct suits

        // manually sort suits by color
        // set first suit
        const blackSuits = suits.filter((s) => this.GetSuitColor(s) === "Black");
        const redSuits = suits.filter((s) => this.GetSuitColor(s) === "Red");

        let firstSuitIndex = 0;
        if (sortType !== Suit.None && sortType !== Suit.Null && suits.some((s) => s === sortType)) {
            firstSuitIndex = suits.findIndex( (s) => s === sortType); // if no trumps, first suit is arbitrary
        } else {
            if (blackSuits > redSuits) {
                firstSuitIndex = suits.findIndex((s) => this.GetSuitColor(s) === "Black");
            } else if (redSuits > blackSuits) {
                firstSuitIndex = suits.findIndex((s) => this.GetSuitColor(s) === "Red");
            }
        }
        // set first suit
        if (firstSuitIndex !== 0) {
            [suits[0], suits[firstSuitIndex]] = [suits[firstSuitIndex], suits[0]]; // array destructuring swap
        }

        // set remaining suits
        for (let i = 1; i < suits.length - 1; i++ ) {

            if (i === 1 && sortType === Suit.Jack
                                && blackSuits > redSuits && this.GetSuitColor(suits[1]) === "Red") {
                const firstBlackSuit = suits.findIndex((s) => this.GetSuitColor(s) === "Black");
                [suits[1], suits[firstBlackSuit]] = [suits[firstBlackSuit], suits[1]];
            } else if (i === 1 && sortType === Suit.Jack
                                && redSuits > blackSuits && this.GetSuitColor(suits[1]) === "Black") {
                const firstRedSuit = suits.findIndex((s) => this.GetSuitColor(s) === "Red");
                [suits[1], suits[firstRedSuit]] = [suits[firstRedSuit], suits[1]];
            } else if (this.GetSuitColor(suits[i]) === this.GetSuitColor(suits[i - 1])) {
                const betterSuit = suits.findIndex((s, j) => j > i
                    && this.GetSuitColor(s) !== this.GetSuitColor(suits[i - 1]));
                if (betterSuit > 0) {
                    [suits[i], suits[betterSuit]] = [suits[betterSuit], suits[i]];
                }
            }
        }

        // sort cards by suit, then by sort
        cards.sort((c1, c2) => this.GetSuit(c1, sortType) === this.GetSuit(c2, sortType)
        ? this.GetSort(c2) - this.GetSort(c1)
        : suits.findIndex((s) => s === this.GetSuit(c1, sortType))
           - suits.findIndex((s) => s === this.GetSuit(c2, sortType)));

    }

    public InsertCard(card: Card, hand: Card[]): number {
        // if hand is not sorted, this obviously will not work
        const cardSuit = this.GetSuit(card);

        // is there a matching suit with lower rank?
        let insertPoint = hand.findIndex(
            (c) => cardSuit === this.GetSuit(c) && this.GetSort(c) < this.GetSort(card));
        // is there a matching suit at all?
        if (insertPoint === -1 && hand.some((c) => this.GetSuit(c) === cardSuit)) {
            insertPoint = hand.findIndex((c) => this.GetSuit(c) === cardSuit)
                + hand.filter((c) => this.GetSuit(c) === cardSuit).length;
        }
        if (insertPoint === -1) {
            // no matching suit; are there two adjacent suits of same color?
            insertPoint = hand.findIndex(
                (c, i) => i > 0
                    && this.GetSuit(c) !== this.GetSuit(hand[i - 1])
                    && this.GetSuitColor(this.GetSuit(c)) === this.GetSuitColor(this.GetSuit(hand[i - 1])));
        }
        if (insertPoint === -1) {
            insertPoint = hand.length;
        }

        hand.splice(insertPoint, 0, card);
        return insertPoint;
    }

    public GetSuitColor(suit: Suit): string {
        switch (suit) {
            case Suit.Spade:
            case Suit.Club:
                return "Black";
            case Suit.Diamond:
            case Suit.Heart:
                return "Red";
            default:
                return "";
        }
    }

    public CompleteBidding() {
        this.tableChan.emit("biddingComplete");
        setTimeout(() => {
            this.SetState(State.Play);
            this.tableChan.emit("beginPlay", this.players[this.currentPlayer].user.id);
        }, 5000);
    }

    public async AwaitResultAsync() {
        while (!this.IsHandComplete()) {
            await this.Sleep(1000);
        }
        await this.Sleep(500);
        return this.ScoreHand();
    }

    public ScoreHand() {
        this.scores = [];
        for (const player of this.players) {
            this.scores[player.index] = {
                id: player.user.id,
                points: (player.trickPile.length / this.players.length),
            };
        }
    }

    public IsHandComplete(): boolean {
        return this.players[0].heldCards.length === 0 && this.currentTrick.length === 0;
    }

    public async EvaluateTrick() {
        let currentWinner = this.trickLeader;
        for (let i = 0; i < this.currentTrick.length; i++) {
            // returns true if follower beats leader
            if (this.Beats(this.currentTrick[i], this.currentTrick[currentWinner])) {
                currentWinner = i;
            }
        }
        await this.Sleep(1000);

        while (this.currentTrick.length > 0) {
            this.players[currentWinner].trickPile.push(this.currentTrick.pop());
        }

        if (!this.IsHandComplete()) {
            this.trickLeader = this.currentPlayer = currentWinner;
        }
        this.tableChan.emit("trickWon", this.players[currentWinner].user.id);
    }

    public Beats(follow: Card, lead: Card) {
        if (this.IsTrump(follow)) {
            return !this.IsTrump(lead) || this.GetSort(follow) > this.GetSort(lead);
        } else {
            return this.GetSuit(follow) === this.GetSuit(lead) && this.GetSort(follow) > this.GetSort(lead);
        }
    }

    public IsTrump(card: Card) {
        return this.trumpSuit && (this.trumpSuit === this.GetSuit(card));
    }

    public PlayIsLegal(card: Card): boolean {
        if (this.trickLeader === this.currentPlayer) { return true; }
        const ledSuit = this.GetSuit(this.currentTrick[this.trickLeader]);
        return this.GetSuit(card) === ledSuit
        || !this.players[this.currentPlayer].heldCards.find((c) => this.GetSuit(c) === ledSuit);
    }

    public GetSuit(card: Card, sortType?: Suit): Suit {
        const suit: Suit = Suit[card.suit as keyof typeof Suit];
        return suit;
    }

    public GetSort(card: Card): number {
        return card.sort;
    }

    public SetupListeners() {
        for (const player of this.players) {
            player.socket.on("playRequest", (card: Card) => {
                console.log(player.user.name + " request to play " + card.suit + " " + card.description);
                console.log("current player " + this.currentPlayer
                    + " trick leader " + this.trickLeader
                    + " player.index " + player.index);
                const playCard = player.heldCards.find((c) => Card.matches(c, card));
                if (this.state === State.Play && this.currentPlayer === player.index
                    && playCard && this.PlayIsLegal(playCard) && !this.currentTrick[this.currentPlayer]) {
                    this.currentTrick[this.currentPlayer]
                        = player.heldCards.splice(player.heldCards.indexOf(playCard), 1)[0];
                    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
                    this.tableChan.emit("playResponse", {
                        activePlayer:
                            this.currentPlayer === this.trickLeader ? -1 : this.players[this.currentPlayer].user.id,
                        card,
                        userId: player.user.id,
                     });
                    if (this.currentPlayer === this.trickLeader) { // trick is complete
                        this.currentPlayer = -1; // prevent more plays
                        this.EvaluateTrick();
                    }
                }
            });

            player.socket.on("bidRequest", (bidInfo: any) => {
                console.log(player.user.name + " request to bid " + JSON.stringify(bidInfo));
                if (this.state === State.Bid && this.currentPlayer === player.index
                        && this.ProcessBid(player, bidInfo)) {
                    console.log(`Bid accepted: ${JSON.stringify(bidInfo)}` );
                    this.tableChan.emit("bidResponse", {bidInfo, userId: player.user.id});
                } else if (this.currentPlayer !== player.index) {
                    console.log(`Bid rejected: it's ${this.players[this.currentPlayer].user.name}'s turn.`);
                }
            });

        }
    }

    public ProcessBid(player: Player, bidInfo: any): boolean {
        return false; // no bidding in this game
    }

    public SetupStateHandlers() {
        this.stateHandlers[State.Bid] = () => { this.SetState(State.Play); }; // no bidding function for base game (yet)
        this.stateHandlers[State.Play] = () => {
              this.trickLeader = this.currentPlayer = (this.dealerIndex + 1) % this.players.length;
            };
    }

}
