import { EventEmitter } from "events";
import { Server, Socket } from "socket.io";
import { Factory } from ".";
import { Action, Card, GameType, Message, User } from "../../shared/model";
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
                private gameType: GameType, private io: Server, private tableChan: string) {
        const asyncLock = require("async-lock");
        this.lock = new asyncLock();
        this.gameTableEventEmitter = new EventEmitter();
        this.startSession();
    }

    public startSession() {

        // wait for players to connect
        this.players.map((pl) => {
            const socket = pl.socket;
            console.log("Player connected to table");
            // find player and assign appropriate socket
            for (let i = 0; i < this.players.length; i++) {
                // substring search to see if socket ID's are matching
                if (socket.id === this.players[i].socket.id) {

                    console.log("Connected %s to table %s", this.players[i].user.name, this.tableId);
                    socket.join(this.tableChan);
                    this.lock.acquire("key", () => {
                        this.players[i].socket = socket;
                        this.players[i].index = i;

                        this.io.to(this.tableChan).emit("playerSat", { user: this.players[i].user, index: i });

                        this.players[i].connected = true;
                        console.log(this.players.filter((p) => p.connected).length, "players connected");
                    });
                }
            }

            socket.on("disconnect", () => {
                for (const player of this.players) {   // TODO: refactor this approach
                    // substring search to see if socket ID's are matching
                    if (socket.id.indexOf(player.socket.id) >= 0) {
                        player.connected = false;
                        if (this.players.every((p) => !p.connected)) {
                            // reset table
                            this.players.map((p) => p.socket.leave(this.tableChan));
                            this.gameTableEventEmitter.emit("end");
                        }
                    }
                }
            });

            socket.on("requestTableInfo", () => {
                console.log("received requestTableInfo");
                this.lock.acquire("key", () => {
                    // console.log(`Entering locked section for ${this.players[i].user.name}`);
                    console.log(`RequestTableInfo: entering locked section with ${this.players.length} players`);
                    socket.emit("numPlayers", this.players.length);

                    // share connected players
                    for (const sittingPlayer of this.players.filter((p) => p.connected)) {
                        socket.emit("playerSat", { user: sittingPlayer.user, index: sittingPlayer.index });
                    }

                    console.log(`Searching for ${socket.id} in ${this.players.map((p)  => p.socket.id)}`);
                    const player = this.players.find((p) => p.socket.id === socket.id);
                    if (player) {
                        player.ready = true;
                        console.log("Checking match readiness");
                        if (!this.matchActive && this.players.every((p) => p.ready)) {
                            this.matchActive = true;
                            console.log("Starting match");
                            this.match = Factory.buildMatch(this.gameType);
                            this.match.beginMatch(this.players, this.io, this.tableChan);
                        }
                    } else {
                        console.error("Sitting player not found");
                    }
                    console.log(`RequestTableInfo: Leaving locked section`);
                });

            });

            socket.on("message", (m: Message) => {
                if (m.content[0] === "/") {
                    this.executeChatCommand(m);
                } else {
                    // do nothing, this gets handled in the main server now
                    // console.log("[server](message): %s", JSON.stringify(m));
                    // this.io.to(this.tableChan).emit("chatMessage", m);
                }
            });
        });
    }

    protected executeChatCommand(m: Message) {
        switch ((m.content as string).toLowerCase()) {
            case "/demoresult":
                this.io.to(this.tableChan).emit("skatGameResult", {
                    cardPoints: 25,
                    cards: [{
                        description: "Ten",
                        sort: "10",
                        suit: "Spade",
                    }, {
                        description: "Ace",
                        sort: "A",
                        suit: "Club",
                    }, {
                        description: "King",
                        sort: "K",
                        suit: "Heart",
                    }],
                    score: -15,
                    winner: "no one",
                });
                break;
            case "/demohands":
                const myIndex = this.players.find((p) => p.user.id === m.from.id).index;
                for (const index of [0, 1, 2, 3].filter((x) => x !== myIndex)) {
                    const user: User = { name: `player${index}`, id: Number.parseInt(`12345${index}`, 10) };
                    this.io.to(this.tableChan).emit("numPlayers", 4);
                    this.io.to(this.tableChan).emit("playerSat", { user, index });
                    this.io.to(this.tableChan).emit("tableDealCards", { numCards: 10, toUser: user.id });
                }
                break;
            default:
                this.players.find((p) => p.user.id === m.from.id).socket.emit
                    ("chatMessage", { from: m.from.id, content: `Unrecognized command ${m.content}` });
        }
    }
}
