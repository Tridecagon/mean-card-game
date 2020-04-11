
import { Score } from "../../../../shared/model";
import {Player} from "../../model";
import { Hand } from "./hand";

export class Match {

    protected deck: any;
    protected shuffler: any;
    protected dealerIndex: number;
    protected players: Player[] = [];
    protected tableChannel: SocketIO.Namespace;
    protected matchResults: Score[] = [];
    protected hand: Hand;

    constructor() {
        // this.type = GameType.Base; // base type no longer instantiable
    }

    public async beginMatch(players: Player[], tableChan: SocketIO.Namespace) {
        this.players = players;
        this.tableChannel = tableChan;
        for (const player of this.players) {
            this.matchResults[player.index] = {
                id: player.user.id,
                points: 0,
            };
            this.tableChannel.emit("updateScores", this.matchResults);
        }

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
        for (const score of gameResults) {
            const matchScore = this.matchResults.find((m) => m.id === score.id);
            matchScore.points += score.points;
        }
    }

    public MatchComplete() {
        return false;
    }

    public GetHand(): Hand {
        return new Hand(this.players, this.deck, this.tableChannel);
    }

}
