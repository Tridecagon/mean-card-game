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

        await this.AwaitResultAsync();
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

            this.SortCards(player.heldCards);

            player.socket.emit('dealHand', player.heldCards);
            this.tableChan.emit('tableDealCards', {numCards: this.numCards, toUser: player.user.id});
        }
    }

    SortCards(cards: Card[]) {
        const suits = Array.from(new Set(cards.map(card => this.GetSuit(card)))); // gets distinct suits
    
        // manually sort suits by color
        // set first suit
        var firstSuitIndex = 0;
        if(this.trumpSuit && this.trumpSuit.length > 0) {
            firstSuitIndex = suits.findIndex( s => s === this.trumpSuit);
        } else {
            const blackSuits = suits.filter(s => this.GetSuitColor(s) === 'Black');
            const redSuits = suits.filter(s => this.GetSuitColor(s) === 'Red');

            if (blackSuits > redSuits) {
                firstSuitIndex = suits.findIndex(s => this.GetSuitColor(s) === 'Black');
            }
            else if (redSuits > blackSuits) {
                firstSuitIndex = suits.findIndex(s => this.GetSuitColor(s) === 'Red');
            }
        }
        // set first suit
        if(firstSuitIndex != 0) {
            [suits[0], suits[firstSuitIndex]] = [suits[firstSuitIndex], suits[0]]; // array destructuring
        }

        // set remaining suits
        for(var i = 1; i < suits.length - 1; i++ ) // nothing to do on last suit item
        {
            if(this.GetSuitColor(suits[i]) === this.GetSuitColor(suits[i - 1]))
            {
                var betterSuit = suits.findIndex((s, j) => j > i && this.GetSuitColor(s) !== this.GetSuitColor(suits[i - 1]));
                if(betterSuit > 0) {
                    [suits[i], suits[betterSuit]] = [suits[betterSuit], suits[i]];
                }
            }
        }
        
        // sort cards by suit, then by sort
        cards.sort((c1, c2) => this.GetSuit(c1) === this.GetSuit(c2) ? c2.sort - c1.sort : suits.findIndex(s => s === this.GetSuit(c1)) - suits.findIndex(s => s=== this.GetSuit(c2)));


    }

    GetSuitColor(suit: string): string {
        switch(suit) {
            case 'Spade':
            case 'Club':
                return 'Black';
            case 'Diamond':
            case 'Heart':
                return 'Red';
            default:
                return '';
        }
    }

    CompleteBidding() {
        setTimeout(() => {
            this.SetState(State.Play);
            this.tableChan.emit('beginPlay', this.players[this.currentPlayer].user.id);
        }, 5000);
    }

    async AwaitResultAsync() {
        while(!this.IsHandComplete()) {
            await this.Sleep(1000);
        }
        this.ScoreHand();
    }

    ScoreHand() {
        this.scores = [];
        for(let player of this.players) {
            this.scores[player.index] = {
                points: (player.trickPile.length / this.players.length),
                id: player.user.id};
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
            return !this.IsTrump(lead) || follow.sort > lead.sort;
        } else {
            return this.GetSuit(follow) === this.GetSuit(lead) && follow.sort > lead.sort;
        }
    }

    IsTrump(card: Card) {
        return this.trumpSuit && (this.trumpSuit === this.GetSuit(card));
    }

    PlayIsLegal(card: Card) : boolean {
        if(this.trickLeader === this.currentPlayer) return true;
        var ledSuit = this.GetSuit(this.currentTrick[this.trickLeader]);
        return this.GetSuit(card) === ledSuit || !this.players[this.currentPlayer].heldCards.find(c => this.GetSuit(c) === ledSuit);
    }

    GetSuit(card: Card) : string {
        return card.suit;
    }

    SetupListeners() {
        for(let player of this.players) {
            player.socket.on('playRequest', (card: Card) => {
                console.log(player.user.name + ' request to play ' + card.suit + ' ' + card.description);
                console.log('current player ' + this.currentPlayer + ' trick leader' + this.trickLeader + ' player.index '+ player.index)
                let playCard = player.heldCards.find(c => (c.suit === card.suit && c.description === card.description));
                if (this.state == State.Play && this.currentPlayer === player.index && playCard && this.PlayIsLegal(playCard) && !this.currentTrick[this.currentPlayer]) { 
                    this.currentTrick[this.currentPlayer] = player.heldCards.splice(player.heldCards.indexOf(playCard), 1)[0];
                    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
                    this.tableChan.emit('playResponse', {'card': card, 'userId': player.user.id, 'activePlayer': 
                        this.currentPlayer === this.trickLeader ? -1 : this.players[this.currentPlayer].user.id});
                    if(this.currentPlayer === this.trickLeader) { // trick is complete
                        this.currentPlayer = -1; // prevent more plays
                        this.EvaluateTrick();
                    }
                }
            });

            player.socket.on('bidRequest', (bidInfo: any) => {
                console.log(player.user.name + ' request to bid ' + JSON.stringify(bidInfo));
                if (this.state === State.Bid && this.currentPlayer === player.index && this.ProcessBid(player, bidInfo)) { 
                    this.tableChan.emit('bidResponse', {'bidInfo': bidInfo, 'userId': player.user.id});
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