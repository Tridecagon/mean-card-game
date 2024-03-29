import * as express from "express";
import { createServer, Server } from "http";
import { Server as SocketServer, ServerOptions, Socket } from "socket.io";
import * as cors from "cors";

// global
declare var v8debug: any;

import { GameTable } from ".";
import { Action, GameType, Message, Table, User } from "../../shared/model";
import { Player } from "./model";

export class ChatServer {
    public static readonly PORT: number = 8080;

    public debug = typeof v8debug === "object" || /--debug|--inspect/.test(process.execArgv.join(" "));

    private app: express.Application;
    private io: SocketServer<any, any, any, any>;
    private socketOpts: any = {};
    private port: string | number;
    private maxTables = 5;
    private server: Server;

    private users: { [key: string]: User } = {};
    private lobby: Table[] = [];
    private seatMap: Array<{table: number, seat: number}> = [];
    private socketMap: Socket[] = [];
    private recordedConnections: string[] = [];
    private corsOrigins = [/skat(-dev)?\.up\.railway\.app/, /localhost/, /mean-card-game-client-mean-card-game-pr-[0-9]*\.up\.railway\.app/ ];
   

    constructor() {
        this.tableSetup();
        this.createApp();
        this.config();
        this.sockets();
        this.createServer();
        this.listen();

    }

    public getApp(): express.Application {
        return this.app;
    }

    private createApp(): void {
        console.log("Creating express app...");
        this.port = process.env.PORT || 8080;
        this.app = express();
        this.app.use(cors({ origin:  this.corsOrigins    }));
        this.server = createServer(this.app);
        this.app.get('/', (req, res) => res.send ({msg: `Server up!`}));
    }
    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
        console.log("Configuring port " + this.port + "...");

    }

    private monitorConnections() {
        const clients = Array.from(this.io.sockets.sockets.keys());
        let unrecognizedClients = clients.filter((c) => !this.recordedConnections.includes(c));
        if(unrecognizedClients.length > 0) {
          console.log('Sockets changed. Connected clients: ' , clients);
          this.recordedConnections = clients;
        }
        setTimeout(() => this.monitorConnections(), 5000);
    }

    private sockets(): void {
        if (this.debug) {
            this.socketOpts.pingTimeout = 300000;
        }
        this.socketOpts.cors = {
            methods: ["GET", "POST"],
            origin: this.corsOrigins
          };
        // this.socketOpts.wsEngine = require("eiows").Server;
    }

    private createServer(): void {
        this.io = new SocketServer();
        this.monitorConnections();
    }

    private listen(): void {
        this.io.attach(this.server, this.socketOpts);

        this.server.listen(+this.port, () => console.log(`Listening on ${this.port}`));

        this.io.on("connection", (socket: Socket) => {
            console.log("Connected client on port %s.", this.port);
            socket.on("message", (m: Message) => {
                console.log("[server](message): %s", JSON.stringify(m));
                switch (m.action) {
                    case Action.JOINED:
                        socket.emit("lobbyState", this.lobby);
                        this.users[m.from.id] = m.from;
                        this.socketMap[m.from.id] = socket;
                        break;
                    case Action.RENAME:
                        const seatLoc = this.seatMap[m.from.id];
                        this.users[m.from.id].name = m.content.username;
                        if (seatLoc) {
                            this.lobby[seatLoc.table].users[seatLoc.seat] = this.users[m.from.id];
                            this.io.emit("lobbyState", this.lobby);
                        }
                        break;
                    case Action.LEFT:
                        this.unseatUser(m.from.id);
                        delete this.socketMap[m.from.id];
                        delete this.users[m.from.id];
                        this.io.emit("lobbyState", this.lobby);
                        break;
                    default:
                        break;
                }
                this.io.emit("chatMessage", m);
            });

            socket.on("requestSeat", (data: {table: number, seat: number, from: number}) => {
                console.log(`requestSeat ${data.table} ${data.seat} ${data.from}`)
                this.unseatUser(data.from);

                this.lobby[data.table].users[data.seat] = this.users[data.from];
                this.lobby[data.table].userCount++;
                this.seatMap[data.from] = {table: data.table, seat: data.seat};
                this.io.emit("lobbyState", this.lobby);
            });

            socket.on("selectGame", (request: {table: number, gameType: GameType, from: number} ) => {
                if (this.seatMap[request.from].table === request.table) {
                    this.lobby[request.table].gameType = request.gameType;
                    this.io.emit("lobbyState", this.lobby);
                }
            });

            socket.on("requestStartTable", (data: {table: number, from: number}) => {
                if(!this.seatMap[data.from]) {
                    console.log(`requestStartTable: can't find user in seatMap!`, data, this.seatMap);
                    return;
                }
                if (this.seatMap[data.from].table === data.table
                    && this.lobby[data.table].userCount > 0) {
                    this.lobby[data.table].active = true;
                    this.io.emit("lobbyState", this.lobby);

                    const tablePlayers = new Array<Player>();
                    for (const user of this.lobby[data.table].users) {
                        if (user && user.id) {
                            const newPlayer = new Player(user, this.socketMap[user.id]);
                            console.log(`Creating ${user.name} = ${user.id} = ${this.socketMap[user.id].id} at ${data.table}`);
                            tablePlayers.push(newPlayer);

                            newPlayer.socket.emit("startTable", data.table);
                        }
                    }

                    const activeTable = new GameTable(tablePlayers, data.table,
                            this.lobby[data.table].gameType, this.io, `table${data.table}`);
                    activeTable.gameTableEventEmitter.on("end", () => {
                        this.lobby[data.table].active = false;
                        this.io.emit("lobbyState", this.lobby);
                    });
                } else {
                    console.log(`Error: no users counted at table ${data.table} when attempting to start game!`);
                }

            });

            socket.on("disconnect", () => {
                // this.socket();
                const userId = this.socketMap.findIndex((s) => s && s.id === socket.id);
                console.log(`Client ${userId >= 0
                    ? this.users[userId].name : "unnamed user"} disconnected`);

                // cleanup timeout
                setTimeout(() => {
                    if(!this.socketMap[userId] || !this.socketMap[userId].connected) { // user is dead
                        // TODO: edge case - make sure socket hasn't reconnected and disconnected again
                        this.unseatUser(userId);
                        this.io.emit("lobbyState", this.lobby);
                    }
                }, 300000), // user has 5 minutes to reconnect
                this.io.emit("lobbyState", this.lobby);
            });
        });

    }

    private tableSetup() {
        for (let i = 0; i < this.maxTables; i++) {
            const emptyTable: Table = {active: false, userCount: 0, users: [{}, {}, {}, {}], gameType: null};
            this.lobby.push(emptyTable);
        }
    }

       private unseatUser = (userId: number) => {
        if (this.users[userId] && this.seatMap[userId]) {
            this.lobby[this.seatMap[userId].table]
                        .users[this.seatMap[userId].seat] = {};
            this.lobby[this.seatMap[userId].table].userCount--;
            delete this.seatMap[userId];
        }
    }
}
