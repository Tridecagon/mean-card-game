import { EventEmitter } from "events";
import * as socketIo from "socket.io";
import { Factory } from ".";
import { Action, Card, GameType, Message } from "../../shared/model";
import { Match } from "./game/baseGame/match";
import { Player } from "./model";

export class GameTable {

    // This class shouldn't know anything about which game is being played
    // at the table. It handles basic functions of the play area.

    public gameTableEventEmitter: EventEmitter;
    public match: Match;
    private lock: any;
    private matchActive: boolean;

    constructor(private players: Player[], private tableId: number,
                private gameType: GameType, private tableChan: SocketIO.Namespace) {
        const asyncLock = require("async-lock");
        this.lock = new asyncLock();
        this.gameTableEventEmitter = new EventEmitter();
        this.startSession();
    }

    public startSession() {

        // wait for players to connect
        this.tableChan.on("connect", (socket: SocketIO.Socket) => {
            // find player and assign appropriate socket
            for (let i = 0; i < this.players.length; i++) {
                // substring search to see if socket ID's are matching
                if ( socket.id.indexOf( this.players[i].socket.id) >= 0 ) {

                    // console.log('Connected %s to table %s', this.players[i].user.name, this.tableId);
                    this.lock.acquire("key", () => {
                        this.players[i].socket = socket;
                        this.players[i].index = i;

                        this.tableChan.emit("playerSat", { user: this.players[i].user, index: i});

                        this.players[i].connected = true;
                    });
                }
            }

            socket.on("disconnect", () => {
                for (const player of this.players) {   // TODO: refactor this approach
                    // substring search to see if socket ID's are matching
                    if ( socket.id.indexOf( player.socket.id) >= 0 ) {
                        player.connected = false;
                        if (this.players.every((p) => !p.connected)) {
                            // reset table
                            this.tableChan.removeAllListeners();
                            this.gameTableEventEmitter.emit("end");
                        }
                    }
                }
            });

            socket.on("requestTableInfo", () => {
                this.lock.acquire("key", () => {
                    // console.log(`Entering locked section for ${this.players[i].user.name}`);
                    socket.emit("numPlayers", this.players.length);

                    // share connected players
                    for (const sittingPlayer of this.players.filter((p) => p.connected)) {
                        socket.emit("playerSat", { user: sittingPlayer.user, index: sittingPlayer.index});
                    }

                    const player = this.players.find((p) => p.socket.id === socket.id);
                    if (player) {
                        player.ready = true;

                        if (!this.matchActive && this.players.every((p) => p.ready)) {
                            this.matchActive = true;

                            this.match =  Factory.buildMatch(this.gameType);
                            this.match.beginMatch(this.players, this.tableChan);
                        }
                    }
                    // console.log(`Leaving locked section for ${this.players[i].user.name}`);
                });

            });

            socket.on("message", (m: Message) => {
                console.log("[server](message): %s", JSON.stringify(m));
                this.tableChan.emit("chatMessage", m);
            });
        });
    }
}
