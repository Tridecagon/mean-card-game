import {Player} from '../../model';
import { Card, GameType, Score } from '../../../../shared/model';

export class Hand {
    
    protected numCards: number;
    protected currentPlayer = -1;
    protected dealerIndex: number;
    protected currentTrick: Card[] = [];
    protected readyForPlay = false;

    constructor(protected players: Player[], protected deck: any, protected tableChan: SocketIO.Namespace) {
        this.numCards = 10;
        this.SetupListeners();
    }

    async Play(dealerIndex: number) : Promise<Score[]> {
        this.dealerIndex = dealerIndex;
        this.DealHands();
        await this.Bid();
        await this.PlayTricks();

        return this.ScoreHand();
    }

    DealHands() {
        for(let player of this.players) {
            console.log(`Dealing hand to player ${player.user.name} socket ${player.socket.id}`);
            var newHand = this.deck.draw(this.numCards);
            for(let card of newHand) {
                player.heldCards.push({'suit': card.suit, 'description': card.description, 'sort': card.sort});
            }

            player.socket.emit('dealHand', player.heldCards);
            this.tableChan.emit('tableDealCards', {numCards: this.numCards, toUser: player.user.id});
        }
    }
    
    async Bid () {
        // return null;
    }

    ScoreHand() : Score[] {
        let handScores : Score[] = [];
        for(let player of this.players) {
            handScores[player.user.id] = {points: player.trickPile.length / this.players.length};
        }
        return handScores;
    }

    async PlayTricks() {
        this.readyForPlay = true;
        this.currentPlayer = this.dealerIndex + 1 % this.players.length; // enables playRequests to go through

        while(!this.DonePlaying()) {
            await this.PlayTrick();
        }
    }

    DonePlaying() : boolean {
        return this.players[0].heldCards.length === 0;
    }

    async PlayTrick() {
        while (this.currentTrick.filter(x => x).length < this.players.length) {
            let player = this.players[this.currentPlayer];
            // TODO: make this wait for response
            player.socket.once('playRequest', (card: Card) => {
                // console.log(player.user.name + ' request to play ' + card.suit + ' ' + card.description);
                let playCard = player.heldCards.find(c => (c.suit === card.suit && c.description === card.description));
                if (this.currentPlayer === player.index && playCard && this.readyForPlay) { 
                    this.tableChan.emit('playResponse', {'card': card, 'userId': player.user.id});
                    this.currentTrick[this.currentPlayer] = player.heldCards.splice(player.heldCards.indexOf(playCard), 1)[0];
                    this.currentPlayer = this.currentPlayer + 1 % this.players.length;
                }
            });
            this.readyForPlay = false;
            this.currentPlayer = -1;
            this.EvaluateTrick();
        }
    }

    EvaluateTrick() {
        // this.currentPlayer has cycled back around to leader
        let currentWinner = this.currentPlayer;
        for(let i = 0; i < this.currentTrick.length; i++) {
            if(this.Beats(this.currentTrick[currentWinner], this.currentTrick[i])) {
                currentWinner = i;
            }
        }


        this.players[currentWinner].trickPile.push.apply(this.currentTrick);

        // TODO: wait; send message of winner
        // when done
        if(this.players[0].heldCards.length > 0) {
            this.readyForPlay = true;
        }

    }

    Beats(lead: Card, follow: Card) {
        if(this.IsTrump(follow)) {
            return this.IsTrump(lead) && follow.sort > lead.sort;
        } else {
            return follow.suit === lead.suit && follow.sort > lead.sort;
        }
    }

    IsTrump(card: Card) {
        return false;
    }

    SetupListeners() {
        for(let player of this.players) {
            
        }
    }


}