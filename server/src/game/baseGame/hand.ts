import {Player} from '../../model';
import {State} from './state';
import { Card, GameType, Score } from '../../../../shared/model';
import * as socketIo from 'socket.io';

export class Hand {
    
    protected numCards: number;
    protected currentPlayer = -1;
    protected trickLeader = -1;
    protected dealerIndex: number;
    protected currentTrick: Card[] = [];
    protected scores: Score[] = [];
    protected state: State;
    protected params: any;
    protected trumpSuit: string;
    protected stateHandlers: (() => void)[] = []; // array of void functions
    // protected sleep = (ms) => { return new Promise(resolve => {setTimeout(resolve, ms)}) };

    constructor(protected players: Player[], protected deck: any, protected tableChan: SocketIO.Namespace) {
        this.numCards = 10;
        this.SetupListeners();
        this.SetupStateHandlers();
    }

    Sleep(ms: number) : Promise<void> {
        return new Promise(resolve => {setTimeout(resolve, ms)});
    }

    async Play(dealerIndex: number, params: any) : Promise<Score[]> {
        this.dealerIndex = dealerIndex;
        this.params = params; 
        
        this.CollectCards();
        this.deck.shuffle();
        this.DealHands();
        this.SetInitialState();

        await this.AwaitResultAync();
        return this.scores;
    }

    SetInitialState() {
        this.SetState(State.Bid);
        this.trickLeader = this.currentPlayer = (this.dealerIndex + 1) % this.players.length;
    }

    SetState(state: State) {
        this.state = state;
        if(this.stateHandlers[state]) {
            this.stateHandlers[state](); // call associated event function
        }
    }

    CollectCards() {
        for(let player of this.players) {
            this.ReturnToDeck(player.heldCards);
            this.ReturnToDeck(player.trickPile);
        }
    }

    ReturnToDeck(cards: Card[]) {
        while (cards && cards.length > 0) {
            this.deck.cards.push(cards.pop());
        }
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

    async AwaitResultAync() {
        while(!this.IsHandComplete()) {
            await this.Sleep(1000);
        }
        this.ScoreHand();
    }

    ScoreHand() {
        this.scores = [];
        for(let player of this.players) {
            this.scores[player.user.id] = {points: (player.trickPile.length / this.players.length)};
        }
    }

    IsHandComplete() : boolean {
        return this.players[0].heldCards.length === 0 && this.currentTrick.length === 0;
    } 

    async EvaluateTrick() {
        let currentWinner = this.trickLeader;
        for(let i = 0; i < this.currentTrick.length; i++) {
            if(this.Beats(this.currentTrick[i], this.currentTrick[currentWinner])) { // returns true if follower beats leader
                currentWinner = i;
            }
        }

        while(this.currentTrick.length > 0) {
            this.players[currentWinner].trickPile.push(this.currentTrick.pop());
        }

        // TODO: wait; send message of winner
        await this.Sleep(1000);
        this.tableChan.emit('trickWon', this.players[currentWinner].user.id);
        this.trickLeader = this.currentPlayer = currentWinner;
    }

    Beats(follow: Card, lead: Card) {
        if(this.IsTrump(follow)) {
            return this.IsTrump(lead) && follow.sort > lead.sort;
        } else {
            return follow.suit === lead.suit && follow.sort > lead.sort;
        }
    }

    IsTrump(card: Card) {
        return this.trumpSuit && (this.trumpSuit === card.suit);
    }

    PlayIsLegal(card: Card) : boolean {
        if(this.trickLeader === this.currentPlayer) return true;
        var ledSuit = this.currentTrick[this.trickLeader].suit;
        return card.suit === ledSuit || !this.players[this.currentPlayer].heldCards.find(c => c.suit === ledSuit);
    }

    SetupListeners() {
        for(let player of this.players) {
            player.socket.on('playRequest', (card: Card) => {
                console.log(player.user.name + ' request to play ' + card.suit + ' ' + card.description);
                console.log('current player ' + this.currentPlayer + ' trick leader' + this.trickLeader + ' player.index '+ player.index)
                let playCard = player.heldCards.find(c => (c.suit === card.suit && c.description === card.description));
                if (this.state == State.Play && this.currentPlayer === player.index && playCard && this.PlayIsLegal(playCard) && !this.currentTrick[this.currentPlayer]) {  // TODO: validate that play is legal
                    this.tableChan.emit('playResponse', {'card': card, 'userId': player.user.id});
                    this.currentTrick[this.currentPlayer] = player.heldCards.splice(player.heldCards.indexOf(playCard), 1)[0];
                    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
                    if(this.currentPlayer === this.trickLeader) { // trick is complete
                        this.currentPlayer = -1; // prevent more plays
                        this.EvaluateTrick();
                    }
                }
            });

            player.socket.on('bidRequest', (bidInfo: any) => {
                console.log(player.user.name + ' request to bid ' + bidInfo);
                if (this.state === State.Bid && this.currentPlayer === player.index && this.ProcessBid(player, bidInfo)) { 
                    this.tableChan.emit('bidResponse', {'bid': bidInfo, 'userId': player.user.id});
                }
            });

        }
    }

    ProcessBid(player: Player, bidInfo: any) : boolean {
        return false; // no bidding in this game
    }

    SetupStateHandlers() {
        this.stateHandlers[State.Bid] = () => { this.SetState(State.Play)}; // no bidding function for base game (yet)
    }


}