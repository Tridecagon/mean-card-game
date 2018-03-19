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
             this.tableChan.emit('showTrumpCard', this.trumpCard);
            };
    }

    ProcessBid(player: Player, bidInfo: any) : boolean {
        if((!this.bids[player.index]) && bidInfo >= 0 && bidInfo <= this.numCards 
        && (player.index != this.dealerIndex 
            || this.bids.reduce((total, value) => total + value) != this.numCards)) {
                this.bids[player.index] = bidInfo;
                return true;
        }
        return false;
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