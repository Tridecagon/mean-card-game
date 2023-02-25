import * as express from "express";
import { createServer } from "http";
import { Server, ServerOptions, Socket } from "socket.io";

// global
declare var v8debug: any;

import { GameTable } from ".";
import { Action, GameType, Message, Table, User } from "../../shared/model";
import { Player } from "./model";

export class ChatServer {
    public static readonly PORT: number = 8080;

    public debug = typeof v8debug === "object" || /--debug|--inspect/.test(process.execArgv.join(" "));

    private app: express.Application;
    private io: Server<any, any, any, any>;
    private socketOpts: any = {};
    private port: string | number;
    private maxTables = 5;

    private users: { [key: string]: User } = {};
    private lobby: Table[] = [];
    private seatMap: Array<{table: number, seat: number}> = [];
    private socketMap: any[] = [];

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
        this.app = express();
    }
    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
        console.log("Configuring port " + this.port + "...");

    }

    private sockets(): void {
        if (this.debug) {
            this.socketOpts.pingTimeout = 300000;
        }
        this.socketOpts.cors = {
            origin: "http://localhost:4200",
          };
    }

    private createServer(): void {
        this.io = new Server(this.socketOpts);
    }

    private listen(): void {

        this.io.listen(+this.port);
        console.log("Listening on port", this.port);

        this.io.on("connection", (socket: Socket) => {
            console.log("Connected client on port %s.", this.port);
            socket.on("message", (m: Message) => {
                console.log("[server](message): %s", JSON.stringify(m));
                switch (m.action) {
                    case Action.JOINED:
                        socket.emit("lobbyState", this.lobby);
                        this.users[socket.id] = m.from;
                        this.socketMap[m.from.id] = socket;
                        break;
                    case Action.RENAME:
                        const seatLoc = this.seatMap[this.users[socket.id].id];
                        this.users[socket.id].name = m.content.username;
                        if (seatLoc) {
                            this.lobby[seatLoc.table].users[seatLoc.seat] = this.users[socket.id];
                            this.io.emit("lobbyState", this.lobby);
                        }
                        break;
                    case Action.LEFT:
                        this.unseatUser(socket.id);
                        delete this.socketMap[this.users[socket.id].id];
                        delete this.users[socket.id];
                        this.io.emit("lobbyState", this.lobby);
                        break;
                    default:
                        break;
                }
                this.io.emit("chatMessage", m);
            });

            socket.on("requestSeat", (seatLoc: {table: number, seat: number}) => {
                this.unseatUser(socket.id);

                this.lobby[seatLoc.table].users[seatLoc.seat] = this.users[socket.id];
                this.lobby[seatLoc.table].userCount++;
                this.seatMap[this.users[socket.id].id] = seatLoc;
                this.io.emit("lobbyState", this.lobby);
            });

            socket.on("selectGame", (request: {table: number, gameType: GameType}) => {
                if (this.seatMap[this.users[socket.id].id].table === request.table) {
                    this.lobby[request.table].gameType = request.gameType;
                    this.io.emit("lobbyState", this.lobby);
                }
            });

            socket.on("requestStartTable", (tableIndex: number) => {
                if (this.seatMap[this.users[socket.id].id].table === tableIndex
                    && this.lobby[tableIndex].userCount > 0) {
                    this.lobby[tableIndex].active = true;
                    this.io.emit("lobbyState", this.lobby);

                    const tablePlayers = new Array<Player>();
                    for (const user of this.lobby[tableIndex].users) {
                        if (user && user.id) {
                            const newPlayer = new Player(user, this.socketMap[user.id]);
                            console.log(`Creating ${user.name} = ${this.socketMap[user.id].id} at ${tableIndex}`);
                            tablePlayers.push(newPlayer);

                            newPlayer.socket.emit("startTable", tableIndex);
                        }
                    }

                    const activeTable = new GameTable(tablePlayers, tableIndex,
                            this.lobby[tableIndex].gameType, this.io,`table${tableIndex}`);
                    activeTable.gameTableEventEmitter.on("end", () => {
                        this.lobby[tableIndex].active = false;
                        this.io.emit("lobbyState", this.lobby);
                    });
                }

            });

            socket.on("disconnect", () => {
                this.unseatUser(socket.id);
                console.log(`Client ${this.users[socket.id]
                    ? this.users[socket.id].name : "unnamed user"} disconnected`);
                delete this.users[socket.id];
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

       private unseatUser = (socketId: string) => {
        if (this.users[socketId] && this.seatMap[this.users[socketId].id]) {
            this.lobby[this.seatMap[this.users[socketId].id].table]
                        .users[this.seatMap[this.users[socketId].id].seat] = {};
            this.lobby[this.seatMap[this.users[socketId].id].table].userCount--;
            delete this.seatMap[this.users[socketId].id];
        }
    }
}
