
import {Player} from '../../model';
import { Card, GameType, Score } from '../../../../shared/model';
import { Hand } from './hand';

export class Match {
    
    protected deck: any;
    protected shuffler: any;
    protected dealerIndex: number;
    protected players: Player[] = [];
    
    protected matchResults: Score[] = [];
    protected hand: Hand;

    constructor() {
        // this.type = GameType.Base; // base type no longer instantiable
    }

    async beginMatch(players: Player[], tableChan: SocketIO.Namespace) {
        this.players = players;
        for(const player of this.players) {
            this.matchResults[player.index] = {
                points: 0,
                id: player.user.id
            }
        }

        this.deck = this.GetDeck();
        this.hand = this.GetHand(players, tableChan);
        this.dealerIndex = this.PickRandomPlayer();

        while(!this.MatchComplete()) {
            let gameResults = await this.hand.Play(this.dealerIndex, this.GetHandParams());
            this.KeepScore(gameResults);
            this.AdvanceDealer();
        }
    }

    GetDeck() : any {
        this.shuffler = require('shuffle');
        return this.shuffler.shuffle();
    }

    GetHandParams() : any {
        return {};
    }

    AdvanceDealer() {
        this.dealerIndex = (this.dealerIndex + 1 ) % this.players.length;
    }

    PickRandomPlayer() : number {
        return Math.floor(Math.random() * this.players.length);
    }

    KeepScore(gameResults: Score[]) {
        for(let score of gameResults) {
            var matchScore = this.matchResults.find(m => m.id === score.id);
            matchScore.points += score.points;
        }
    }

    MatchComplete() {
        return false;
    }

    GetHand(players: Player[], tableChan: SocketIO.Namespace) : Hand {
        return new Hand(players, this.deck, tableChan);
    }

}