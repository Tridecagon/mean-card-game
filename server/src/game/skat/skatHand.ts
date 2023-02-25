import { Server } from "socket.io";
import { Card, SkatUtil, Suit } from "../../../../shared/model";
import {SkatGameSelection, SkatGameType } from "../../../../shared/model/skat";
import { Player } from "../../model";
import { Hand, State } from "../baseGame";

export class SkatHand extends Hand {
    private skat: Card[] = [];
    private rememberedSkat: Card[] = []; // for result reporting at the end
    private bids: number[] = [];
    private whoseBid: number; // 0 is hold, 1 is middle, 2 is rear
    private holdIndex: number;
    private selectedGame: SkatGameSelection;
    private winningBid: number;
    private winningBidder: number;
    private matadors: number;

    constructor(players: Player[], deck: any, protected io: Server, protected tableChan: string) {
        super(players, deck, io, tableChan);
        this.defaultSortType = Suit.Jack;
    }

    public SetupListeners() {
        super.SetupListeners();

        for (const player of this.players) {
            player.socket.on("selectSkatGame", (selectedGame: SkatGameSelection) => {
                if (player.index === this.currentPlayer
                    && this.state === State.SelectSkatGame
                    && selectedGame.selection !== SkatGameType.None
                    && ( this.winningBid === 5 || selectedGame.selection !== SkatGameType.Ramsch)) {
                    this.selectedGame = selectedGame;
                    if (selectedGame.selection === SkatGameType.Turn) {
                        this.SetState(State.SingleTurn);
                        player.socket.emit("sendTurnCard", this.skat[0]);
                    } else if (selectedGame.selection === SkatGameType.Guetz) {
                        this.trumpSuit = Suit.Jack;
                        this.selectedGame.doubleTurn = true;
                        this.SetState(State.Discard);
                        this.io.to(this.tableChan).emit("gameSelected", selectedGame );
                    } else {
                        setTimeout(() => this.SetState(State.Play), 3000);
                        this.trumpSuit = selectedGame.suit;
                        this.players.map((p) => this.ResortHand(p, selectedGame.suit));
                        if (selectedGame.selection === SkatGameType.NullOvert
                            || selectedGame.selection === SkatGameType.GrandOvert) {
                                this.ShowHand(player);
                            }
                        this.io.to(this.tableChan).emit("gameSelected", selectedGame );
                    }
                }
            });

            player.socket.on("chooseTurn", (turnChoice: string) => {
                if (player.index === this.currentPlayer
                    && (this.state === State.SingleTurn || this.state === State.DoubleTurn)) {
                    switch (turnChoice) {
                        case "DoubleTurn":
                            if (this.state === State.SingleTurn) {
                                this.state = State.DoubleTurn;
                                this.selectedGame.doubleTurn = true;
                                player.socket.emit("sendTurnCard", this.skat[1]);
                            } else {
                                console.log("Invalid state for Double Turn!");
                            }
                            break;
                        case "Jacks":
                            if ((this.state === State.SingleTurn && this.skat[0].description === "Jack")
                             || (this.state === State.DoubleTurn && this.skat[1].description === "Jack")) {
                                  const doubleTurn = this.state === State.DoubleTurn;
                                  const turnCard = doubleTurn ? this.skat[1] : this.skat[0];
                                  this.trumpSuit = Suit.Jack;
                                  this.SetState(State.Discard);
                                  this.io.to(this.tableChan).emit("gameSelected",
                                    {
                                        doubleTurn,
                                        selection: SkatGameType.Turn,
                                        suit: "Jack",
                                        turnCard,
                                    });
                            }
                            break;
                        default:
                            if ((this.state === State.SingleTurn && this.skat[0].suit === turnChoice)
                            || (this.state === State.DoubleTurn && this.skat[1].suit === turnChoice)) {
                                const doubleTurn = this.state === State.DoubleTurn;
                                const turnCard = doubleTurn ? this.skat[1] : this.skat[0];
                                this.trumpSuit = Suit[turnChoice as keyof typeof Suit];
                                this.SetState(State.Discard);
                                this.io.to(this.tableChan).emit("gameSelected",
                                {
                                    doubleTurn,
                                    selection: SkatGameType.Turn,
                                    suit: turnChoice,
                                    turnCard,
                                });
                            }
                            break;
                    }

                }
            });

            player.socket.on("discardSkat", (cards: Card[]) => {
                if (player.index === this.currentPlayer
                    && this.state === State.Discard
                    && cards.length === 2
                    && (cards[0].sort !== cards[1].sort || cards[0].suit !== cards[1].suit)
                    && cards.every((c) => player.heldCards.some((h) => h.sort === c.sort && h.suit === c.suit))) {
                        for (const discard of cards) {
                            this.skat.push(player.heldCards.splice(
                                player.heldCards.findIndex(
                                    (c) => c.sort === discard.sort && c.suit === discard.suit), 1)[0]);
                        }
                        player.socket.emit("confirmDiscard", cards);
                        this.SetState(State.Play);
                    }
            });

            player.socket.on("selectSort", (sortType: Suit) => {
                this.ResortHand(player, sortType);
            });
        }
    }

    public SetInactivePlayer() {
        if (this.players.length === 3) {
            this.inactivePlayer = -1;
        } else {
            this.inactivePlayer = this.dealerIndex;
        }
    }

    public DealHands() {
        this.skat = this.deck.draw(2);
        this.rememberedSkat = this.skat.map((x) => Object.assign({}, x));
        this.numCards = 10;
        super.DealHands();
    }

    public CollectCards() {
        if (this.skat.length > 0) {
            this.ReturnToDeck(this.skat);
        }
        super.CollectCards();
    }
    public SetupStateHandlers() {
        this.stateHandlers[State.Bid] = () => {
            this.trumpSuit = Suit.Jack;
            this.bids = [-1, -1, -1];
            this.whoseBid = 1;
            this.holdIndex = (this.dealerIndex + 1) % this.players.length;
            this.currentPlayer = (this.holdIndex + 1) % this.players.length;
            this.winningBidder = undefined;
            this.io.to(this.tableChan).emit("startBidding", {
                dealerId: this.players[this.dealerIndex].user.id,
                gameType: "Skat",
                holdId: this.players[this.holdIndex].user.id,
            });
        };

        this.stateHandlers[State.Discard] = () => {
            // add skat cards into player's hand, sorted
            // send them to player
            this.players.map((p) => this.ResortHand(p, this.trumpSuit));
            const activePlayer = this.players[this.currentPlayer];
            while (this.skat.length) {
                const skatCard = this.skat.shift();
                const position = this.InsertCard(skatCard, activePlayer.heldCards);
                activePlayer.socket.emit("insertCard", {card: skatCard, index: position});
                console.log(`Added ${skatCard.toString()} to ${activePlayer.user.name}'s hand`);

            }
        };

        this.stateHandlers[State.Play] = () => {
            this.trickLeader = this.currentPlayer = this.holdIndex;
            this.matadors = this.countMatadors();
            this.io.to(this.tableChan).emit("beginPlay", this.players[this.currentPlayer].user.id);
        };
    }

    public ProcessBid(player: Player, bidInfo: any): boolean {

        const bidVal: number = Number(bidInfo.bid);
        if (this.ValidBid(player, bidVal)) {
            this.bids[this.whoseBid] = bidVal;
            if (!this.SetNextBidder(bidInfo)) {
                this.CompleteBidding();
            }
            bidInfo.activePlayer = this.players[this.currentPlayer].user.id;
            return true;
        }
        return false;
    }
    // returns true if bidding is still going
    public SetNextBidder(bidInfo: any): boolean {
        if (this.bids[0] === -1 && this.bids[1] === 0 && this.bids[2] === 0) { // hold wins by default; ramsch possible
            this.winningBid = this.bids[0] = 5;
            this.currentPlayer = this.holdIndex;
            return false;
        }

        if (this.bids.filter((b) => b === 0).length === 2) {// two people have passed, bidding is over
            const winnerIndex = this.bids.findIndex((b) => b > 0);
            this.currentPlayer = (this.holdIndex + winnerIndex) % this.players.length;
            this.winningBid = this.bids[winnerIndex];
            return false;
        }

        let newBidder: number; // 0 is hold
        if (bidInfo.bid === 0) { // current bid is the first pass, bring 3rd player into bidding
            newBidder = 2;
        } else { // first person who hasn't passed and isn't the current bidder
            newBidder = this.bids.findIndex((b, i) => b !== 0 && i !== this.whoseBid);
        }

        bidInfo.mode = (newBidder > this.whoseBid) ? "bid" : "respond";
        this.whoseBid = newBidder;
        this.currentPlayer = (this.holdIndex + this.whoseBid) % this.players.length;
        bidInfo.currentPlayer = this.currentPlayer;
        return true;
    }

    public ValidBid(player: Player, bidVal: number): boolean {
        // check turn
        if (player.index !== (this.holdIndex + this.whoseBid) % this.players.length) {
            return false;
        }

        // check valid bid
        // is this a pass?
        if (bidVal === 0) {
            return true;
        }

        // is there a higher bid?
        if (this.bids.some((b) => b > bidVal)) {
            return false;
        }

        // is there an equal bid from an earlier player?
        if (this.bids.some((b, i) => b === bidVal && i < this.whoseBid)) {
            return false;
        }

        // is the bid number valid?
        if (SkatUtil.invalidBids.some((b) => b === bidVal) || bidVal < 10) {
            return false;
        }
        return true;
    }

    public GetSuit(card: Card, sortType: Suit = this.trumpSuit || Suit.Jack): Suit {
        const naturalSuit = Suit[card.suit as keyof typeof Suit];
        switch (sortType) {
            case Suit.Null:
                return naturalSuit;
            case Suit.Jack:
                return card.description === "Jack" ? Suit.Jack : naturalSuit;
            default:
                return card.description === "Jack" ? sortType : naturalSuit;
        }
    }

    public GetSort(card: Card, sortType: Suit = this.trumpSuit || Suit.Jack): number {
        switch (sortType) {
            case Suit.Null:
                return card.sort;
            default:
                switch (card.description) {
                    case "Ten":
                        return 13.5;
                    // Jacks in order
                    case "Jack":
                        switch (card.suit) {
                            case "Diamond":
                                return 15;
                            case "Heart":
                                return 16;
                            case "Spade":
                                return 17;
                            case "Club":
                                return 18;
                            default:
                                throw Error(`card ${card} has unexpected suit!`);
                        }
                    default:
                        return card.sort;
                }
        }
    }

    public CompleteBidding() {
        this.winningBidder = this.currentPlayer;
        console.log
          (`Bidding complete. Winning bidder: ${this.players[this.winningBidder].user.name}, bid: ${this.winningBid}`);
        this.SetState(State.SelectSkatGame);
        this.io.to(this.tableChan).emit("biddingComplete",
        {
            bid: this.winningBid,
            winner: this.players[this.winningBidder].user.name,
        });
    }

    public ScoreHand() {
        const baseValue = this.GetBaseValue();
        switch (this.selectedGame.selection) {
            case SkatGameType.Null:
            case SkatGameType.NullOvert:
                this.scores.push({
                    id: this.players[this.winningBidder].user.id,
                    points: this.players[this.winningBidder].trickPile.length === 0 ? baseValue : (-1 * baseValue),
                });
                this.io.to(this.tableChan).emit("skatGameResult", {
                    cardPoints: 0,
                    cards: this.players[this.winningBidder].trickPile,
                    score: this.scores[0].points,
                    skat: this.rememberedSkat,
                });
                break;
            case SkatGameType.Solo:
            case SkatGameType.Turn:
            case SkatGameType.Guetz:
            case SkatGameType.Grand:
            case SkatGameType.GrandOvert:
                this.players[this.winningBidder].trickPile.push(...this.skat);
                this.skat = [];
                const cardPoints = this.countCardPoints(this.players[this.winningBidder].trickPile);
                const scorePoints = this.EvaluateStandardGame(baseValue, cardPoints);
                this.scores.push({
                    id: this.players[this.winningBidder].user.id,
                    points: scorePoints,
                });
                this.io.to(this.tableChan).emit("skatGameResult", {
                    cardPoints,
                    cards: this.players[this.winningBidder].trickPile.filter((c) => c.sort > 9),
                    score: scorePoints,
                    skat: this.rememberedSkat,
                });
                break;
            case SkatGameType.Ramsch:
                this.players[this.currentPlayer].trickPile.push(...this.skat);
                this.skat = [];
                const pointScores = this.players.map((p, index) =>
                    index === this.inactivePlayer ? -1 : this.countCardPoints(p.trickPile));
                const minPoints = Math.min(...pointScores.filter((s) => s >= 0));
                const winners = pointScores.filter((s) => s === minPoints);
                let winnerName = "";
                if (winners.length === 1) {
                    const winner = pointScores.findIndex((s) => s === minPoints);
                    winnerName = this.players[winner].user.name;
                    this.scores.push({
                        id: this.players[winner].user.id,
                        points: this.players[winner].trickPile.length === 0 ? 20 : 10,
                    });
                } else { // two winners or one loser
                    if (minPoints === 0) {
                        const loser = pointScores.findIndex((s) => s !== 0);
                        if (this.players[loser].trickPile.length === 32) {
                            winnerName = this.players[loser].user.name;
                            this.scores.push({
                                id: this.players[loser].user.id,
                                points: -30,
                            });
                        }
                    } else {
                        // for now, just award 5 to both on ties since we're not tracking trick order
                        const winnerNameList: string[] = [];
                        for (let i = 0; i < this.players.length; i++) {
                            if (pointScores[i] === minPoints) {
                                this.scores.push({
                                    id: this.players[i].user.id,
                                    points: 5,
                                });
                                winnerNameList.push(this.players[i].user.name);
                            }
                        }
                        winnerName = winnerNameList.join(", ");
                    }
                }
                this.io.to(this.tableChan).emit("skatGameResult", {
                    cardPoints: winners[0],
                    score: this.scores[0].points,
                    skat: this.rememberedSkat,
                    winner: winnerName,
                });
                break;
        }
    }

    private EvaluateStandardGame(baseValue: number, cardPoints: number): number {
        let wonGame: boolean;
        if (this.selectedGame.declarations.schwarz) {
            wonGame = this.players[this.winningBidder].trickPile.length === 32;
        } else if (this.selectedGame.declarations.schneider) {
            wonGame = cardPoints >= 91;
        } else {
            wonGame = cardPoints >= 61;
        }
        if (wonGame) {
            let factors = 1 + this.matadors
              + (cardPoints >= 91 ? 1 : 0)
              + (this.players[this.winningBidder].trickPile.length === 32 ? 1 : 0)
              + (this.selectedGame.declarations.schneider ? 1 : 0)
              + (this.selectedGame.declarations.schwarz ? 1 : 0);
            if (factors * baseValue < this.winningBid) {
                console.log(`Detected underbid: bid ${this.winningBid} but earned ${factors * baseValue}`);
                while (factors * baseValue < this.winningBid) {
                    factors++;
                }
                return factors * baseValue * (this.selectedGame.doubleTurn ? -2 : -1);
            }
            return factors * baseValue;
        } else {
            const factors = 1 + this.matadors
              + ((cardPoints < 31 || this.selectedGame.declarations.schneider) ? 1 : 0)
              + ((this.players[this.winningBidder].trickPile.length === 2
                      || this.selectedGame.declarations.schwarz) ? 1 : 0)
              + (this.selectedGame.declarations.schneider ? 1 : 0)
              + (this.selectedGame.declarations.schwarz ? 1 : 0);
            return factors * baseValue * (this.selectedGame.doubleTurn ? -2 : -1);
        }

    }

    private GetBaseValue(): number {
        switch (this.selectedGame.selection) {

            case SkatGameType.Null:
                return 20;
            case SkatGameType.NullOvert:
                return 40;
            case SkatGameType.Guetz:
                return 16;
            case SkatGameType.Grand:
                return 20;
            case SkatGameType.GrandOvert:
                return 24;
            case SkatGameType.Solo:
                switch (this.trumpSuit) {
                    case Suit.Club:
                        return 12;
                    case Suit.Spade:
                        return 11;
                    case Suit.Heart:
                        return 10;
                    case Suit.Diamond:
                        return 9;
                }
            case SkatGameType.Turn:
                switch (this.trumpSuit) {
                    case Suit.Jack:
                        return 12;
                    case Suit.Club:
                        return 8;
                    case Suit.Spade:
                        return 7;
                    case Suit.Heart:
                        return 6;
                    case Suit.Diamond:
                        return 5;
                }
        }
    }

    private countMatadors() {
        const sequence: Card[] = [
            {suit: "Club", description: "Jack", sort: 0},
            {suit: "Spade", description: "Jack", sort: 0},
            {suit: "Heart", description: "Jack", sort: 0},
            {suit: "Diamond", description: "Jack", sort: 0},
        ];
        const trumpSuit = Suit[this.trumpSuit];
        if (["Club", "Spade", "Heart", "Diamond"].indexOf(trumpSuit) >= 0) {
            sequence.push(...[
                {suit: trumpSuit, description: "Ace", sort: 0},
                {suit: trumpSuit, description: "Ten", sort: 0},
                {suit: trumpSuit, description: "King", sort: 0},
                {suit: trumpSuit, description: "Queen", sort: 0},
                {suit: trumpSuit, description: "Nine", sort: 0},
                {suit: trumpSuit, description: "Eight", sort: 0},
                {suit: trumpSuit, description: "Seven", sort: 0},
            ]);
        }

        const cards = this.players[this.winningBidder].heldCards.concat(this.skat);
        if (cards.some((c) => Card.matches(c, sequence[0]))) {
            let numWith = 0;
            for (const s of sequence) {
                if (cards.some((c) => Card.matches(c, s))) {
                    numWith++;
                } else {
                    return numWith;
                }
            }
            // just in case with 11.... lol
            // wait this actually matters for Jacks with 4
            return numWith;
        } else {
            let numWithout = 0;
            for (const s of sequence) {
                if (cards.some((c) => Card.matches(c, s))) {
                    return numWithout;
                } else {
                    numWithout++;
                }
            }
            // i suppose without 11 is technically possible if you're an idiot
            // guetz without 4 is definitely possible though
            return numWithout;
        }
    }

    private countCardPoints(cards: Card[]): number {
        // TODO: display this result
        const points = cards.map((c): number => {
            switch (c.description) {
                case "Ace":
                    return 11;
                case "Ten":
                    return 10;
                case "King":
                    return 4;
                case "Queen":
                    return 3;
                case "Jack":
                    return 2;
                default:
                    return 0;
            }
        }).reduce((a, b) => a + b, 0);

        console.log(`Counted ${points} points`);
        return points;
    }

    private ResortHand(player: Player, sortType: Suit) {
        this.SortCards(player.heldCards, sortType);
        player.socket.emit("resortHand", {type: sortType, order: player.heldCards});
    }

}
