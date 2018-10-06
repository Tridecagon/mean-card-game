import { Player } from '../../model';
import { Card, GameType, Score } from '../../../../shared/model';
import { Hand, State } from '../baseGame';

export class SkatHand extends Hand {

    private skat: Card[] = [];
    private bids: number[] = [];

    constructor(players: Player[], deck: any, tableChan: SocketIO.Namespace) {
        super(players, deck, tableChan);
    }

    DealHands() {
        this.skat = this.deck.draw(2);
        this.numCards = 10;
        super.DealHands();
    }

    CollectCards() {
        if(this.skat) {
            this.ReturnToDeck(this.skat);
        }
        super.CollectCards();
    }
    SetupStateHandlers() {
        this.stateHandlers[State.Bid] = () => {

             this.tableChan.emit('startBidding', {'dealerId': this.players[this.dealerIndex].user.id});
            };
    }

    // TODO: this is wrong, fix
    ProcessBid(player: Player, bidInfo: any) : boolean {
        const bidVal : number = Number(bidInfo.bid);
        if((!this.bids[player.index]) && !Number.isNaN(bidVal)  && bidVal >= 0 && bidVal <= this.numCards 
          && (player.index != this.dealerIndex 
            || this.bids.reduce((total, value) => total + value) + bidVal != this.numCards)) {
                this.bids[player.index] = bidVal;
                bidInfo.totalTricks = this.numCards;
                bidInfo.totalBid = this.bids.reduce((total, value) => total + value);
                if(player.index === this.dealerIndex)
                    this.CompleteBidding();
                this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
                return true;
        }
        return false;
    }

    GetSuit(card: Card) : string {
        switch(this.trumpSuit)
        {
            case "Null":
                return card.suit;
            case "Jacks":
                return card.description === "Jack" ? "Jacks" : card.suit;
            default:
                return card.description === "Jack" ? this.trumpSuit : card.suit;
        }
    }

    // TODO: this is wrong, fix
    ScoreHand() {
        this.scores = [];
        for(let player of this.players) {
            const numTricks = player.trickPile.length / this.players.length;
            this.scores[player.index] = {
                points: (numTricks + (this.bids[player.index] === numTricks ? 10 : 0)),
                id: player.user.id};
        }
    }
}