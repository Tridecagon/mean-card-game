import { Card, GameType, Score, Suit } from "../../../../shared/model";
import { Player } from "../../model";
import { Hand, State } from "../baseGame";

export class OhHellHand extends Hand {

    private trumpsBroken = false;
    private trumpCard: Card;
    private bids: number[] = [];

    constructor(players: Player[], deck: any, tableChan: SocketIO.Namespace) {
        super(players, deck, tableChan);
    }

    public DealHands() {
        this.trumpCard = this.deck.draw();
        this.trumpSuit = Suit[this.trumpCard.suit as keyof typeof Suit];
        this.numCards = this.params.numCards;
        this.trumpsBroken = false;
        super.DealHands();
    }

    public CollectCards() {
        if (this.trumpCard) {
            this.ReturnToDeck([this.trumpCard]);
        }
        super.CollectCards();
    }
    public SetupStateHandlers() {
        this.stateHandlers[State.Bid] = () => {

             this.tableChan.emit("startBidding", {
                dealerId: this.players[this.dealerIndex].user.id,
                 gameType: "Oh Hell",
                 trumpCard: this.trumpCard,
                });
            };
    }

    public ProcessBid(player: Player, bidInfo: any): boolean {
        const bidVal: number = Number(bidInfo.bid);
        if ((!this.bids[player.index]) && !Number.isNaN(bidVal)  && bidVal >= 0 && bidVal <= this.numCards
          && (player.index !== this.dealerIndex
            || this.bids.reduce((total, value) => total + value) + bidVal !== this.numCards)) {
                this.bids[player.index] = bidVal;
                bidInfo.totalTricks = this.numCards;
                bidInfo.totalBid = this.bids.reduce((total, value) => total + value);

                this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
                bidInfo.currentPlayer = this.currentPlayer;
                if (player.index === this.dealerIndex) {
                    this.CompleteBidding();
                }
                return true;
        }
        return false;
    }

    public PlayIsLegal(card: Card): boolean {
        if (this.currentPlayer === this.trickLeader && this.GetSuit(card) === this.trumpSuit && !this.trumpsBroken) {
            return this.players[this.currentPlayer].heldCards.every((c) => this.GetSuit(card) === this.trumpSuit);
        } // legal to lead trump if it's all you have
        return super.PlayIsLegal(card);
    }

    public async EvaluateTrick() {
        if (this.currentTrick.some((c) => this.GetSuit(c) === this.trumpSuit)) {
            this.trumpsBroken = true;
        }
        super.EvaluateTrick();
    }

    public ScoreHand() {
        this.scores = [];
        for (const player of this.players) {
            const numTricks = player.trickPile.length / this.players.length;
            this.scores[player.index] = {
                id: player.user.id,
                points: (numTricks + (this.bids[player.index] === numTricks ? 10 : 0)),
                };
        }
    }
}
