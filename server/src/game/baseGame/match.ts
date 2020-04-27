
import { Score } from "../../../../shared/model";
import {Player} from "../../model";
import { Hand } from "./hand";

export class Match {

    protected deck: any;
    protected shuffler: any;
    protected dealerIndex: number;
    protected players: Player[] = [];
    protected tableChannel: SocketIO.Namespace;
    protected matchResults: any[] = [];
    protected hand: Hand;
    protected round: number;

    constructor() {
        // this.type = GameType.Base; // base type no longer instantiable
    }

    public async beginMatch(players: Player[], tableChan: SocketIO.Namespace) {
        this.players = players;
        this.tableChannel = tableChan;

        this.round = 0;
        this.matchResults[0] = {};

        this.deck = this.GetDeck();
        this.hand = this.GetHand();
        this.dealerIndex = this.PickRandomPlayer();

        while (!this.MatchComplete()) {
            const gameResults = await this.hand.Play(this.dealerIndex, this.GetHandParams());
            this.KeepScore(gameResults);
            this.AdvanceDealer();
        }
    }

    public GetDeck(): any {
        this.shuffler = require("shuffle");
        return this.shuffler.shuffle();
    }

    public GetHandParams(): any {
        return {};
    }

    public AdvanceDealer() {
        this.dealerIndex = (this.dealerIndex + 1 ) % this.players.length;
    }

    public PickRandomPlayer(): number {
        return Math.floor(Math.random() * this.players.length);
    }

    public KeepScore(gameResults: Score[]) {
        this.round++;
        this.matchResults[this.round - 1] = {
            Round: this.round,
        };
        gameResults.map((score: Score) => {
            if (score && score.points !== undefined) {
             const playerIndex = this.players.findIndex((p) => p.user.id === score.id);
             this.matchResults[this.round - 1][this.players[playerIndex].user.name] = score.points;
            }
        });
        console.log("Total scores:");
        this.players.map((p) => {
            const totalScore = this.matchResults.reduce((acc, cur) => acc + cur[this.players[p.index].user.name], 0);
            console.log(`${p.user.name}: ${totalScore}`);
        });
        this.tableChannel.emit("updateScores", this.matchResults);
    }

    public MatchComplete() {
        return false;
    }

    public GetHand(): Hand {
        return new Hand(this.players, this.deck, this.tableChannel);
    }

}
