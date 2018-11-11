import { Player } from '../../model';
import { Card, GameType, Score } from '../../../../shared/model';
import { Hand, State } from '../baseGame';

export class OhHellHand extends Hand {

    private trumpsBroken = false;
    private trumpCard : Card;
    private bids: number[] = [];

    constructor(players: Player[], deck: any, tableChan: SocketIO.Namespace) {
        super(players, deck, tableChan);
    }

    DealHands() {
        this.trumpCard = this.deck.draw();
        this.trumpSuit = this.trumpCard.suit;
        this.numCards = this.params.numCards;
        this.trumpsBroken = false;
        super.DealHands();
    }

    CollectCards() {
        if(this.trumpCard) {
            this.ReturnToDeck([this.trumpCard]);
        }
        super.CollectCards();
    }
    SetupStateHandlers() {
        this.stateHandlers[State.Bid] = () => {

             this.tableChan.emit('startBidding', {'gameType': 'Oh Hell', 'trumpCard': this.trumpCard, 'dealerId': this.players[this.dealerIndex].user.id});
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

                
                this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
                bidInfo.currentPlayer = this.currentPlayer;
                if(player.index === this.dealerIndex)
                    this.CompleteBidding();
                return true;
        }
        return false;
    }

    PlayIsLegal(card: Card) : boolean {
        if(this.currentPlayer === this.trickLeader && card.suit === this.trumpSuit && !this.trumpsBroken)
            return this.players[this.currentPlayer].heldCards.every(c => c.suit === this.trumpSuit); //legal to lead trump if it's all you have
        return super.PlayIsLegal(card);
    }
    async EvaluateTrick() {
        if(this.currentTrick.some(c => c.suit === this.trumpSuit)) {
            this.trumpsBroken = true;
        }
        super.EvaluateTrick();
    }

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