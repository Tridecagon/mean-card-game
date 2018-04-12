import { Player } from '../../model';
import { Card, GameType, Score } from '../../../../shared/model';
import { Hand, State } from '../baseGame';

export class OhHellHand extends Hand {

    private trumpCard : Card;
    private bids: number[] = [];

    constructor(players: Player[], deck: any, tableChan: SocketIO.Namespace) {
        super(players, deck, tableChan);
    }

    DealHands() {
        this.numCards = this.params.numCards;
        super.DealHands();
    }
    SetupStateHandlers() {
        this.stateHandlers[State.Bid] = () => {
             this.trumpCard = this.deck.draw();
             this.trumpSuit = this.trumpCard.suit;
             this.tableChan.emit('startBidding', {'trumpCard': this.trumpCard, 'dealerId': this.players[this.dealerIndex].user.id});
            };
    }

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

    CompleteBidding() {
        setTimeout(() => {
            this.SetState(State.Play);
            this.tableChan.emit('beginPlay');
        }, 5000);
    }

    ScoreHand() {
        this.scores = [];
        for(let player of this.players) {
            const numTricks = player.trickPile.length / this.players.length;
            this.scores[player.user.id] = {points: (numTricks
                        + this.bids[player.index] === numTricks ? 10 : 0)};
        }
    }
}