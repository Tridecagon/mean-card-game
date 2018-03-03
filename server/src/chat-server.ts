import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import { Message, User, Table, Action } from '../../shared/model';
import { GameTable } from '.';
import { Player } from './model';

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    private maxTables = 5;

    private users: User[] = [];
    private lobby: Table[] = [];
    private seatMap: {table: number, seat: number}[] = [];
    private socketMap: any[] = [];


    constructor() {
        this.tableSetup();
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();

    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
            socket.on('message', (m: Message) => {
                console.log('[server](message): %s', JSON.stringify(m));
                switch (m.action) {
                    case Action.JOINED:
                        socket.emit('lobbyState', this.lobby);
                        this.users[socket.id] = m.from;
                        this.socketMap[m.from.id] = socket;
                        break;
                    case Action.RENAME:
                        let seatLoc = this.seatMap[this.users[socket.id].id];
                        this.users[socket.id].name = m.content.username;
                        if (seatLoc) {
                            this.lobby[seatLoc.table].users[seatLoc.seat] = this.users[socket.id];
                             this.io.emit('lobbyState', this.lobby);
                        }
                        break;
                    case Action.LEFT:
                        this.unseatUser(socket.id);
                        delete this.socketMap[this.users[socket.id].id];
                        delete this.users[socket.id];
                        this.io.emit('lobbyState', this.lobby);
                        break;
                    default:
                        break;
                }
                this.io.emit('chatMessage', m);
            });

            socket.on('requestSeat', (seatLoc: {table: number, seat: number}) => {
                this.unseatUser(socket.id);

                this.lobby[seatLoc.table].users[seatLoc.seat] = this.users[socket.id];
                this.lobby[seatLoc.table].userCount++;
                this.seatMap[this.users[socket.id].id] = seatLoc;
                this.io.emit('lobbyState', this.lobby);
            });

            socket.on('requestStartTable', (tableIndex: number) => {
                if (this.seatMap[this.users[socket.id].id].table == tableIndex && this.lobby[tableIndex].userCount > 1) {
                    this.lobby[tableIndex].active = true;
                    this.io.emit('lobbyState', this.lobby);

                    let tablePlayers = new Array<Player>();
                    for (let user of this.lobby[tableIndex].users) {
                        if(user && user.id) {
                            const newPlayer = new Player(user, this.socketMap[user.id])
                            tablePlayers.push(newPlayer);
                            
                            newPlayer.socket.emit('startTable', tableIndex);
                        }
                    }

                    var activeTable = new GameTable(tablePlayers, tableIndex, this.io.of(`/table${tableIndex}`));
                    activeTable.gameEventEmitter.on('end', () => {
                        this.lobby[tableIndex].active = false;
                        this.io.emit('lobbyState', this.lobby);
                    });
                }

            });

            socket.on('disconnect', () => {
                this.unseatUser(socket.id);
                console.log(`Client ${this.users[socket.id] ? this.users[socket.id].name : 'unnamed user'} disconnected`);
                delete this.users[socket.id];
                this.io.emit('lobbyState', this.lobby);
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

    private tableSetup() {
        for (let i = 0; i < this.maxTables; i++) {
            let emptyTable: Table = {active: false, userCount: 0, users: [{}, {}, {}, {}]};
            this.lobby.push(emptyTable);
        }
    }

       private unseatUser = (socketId: any) => {
        if (this.users[socketId] && this.seatMap[this.users[socketId].id]) {
            this.lobby[this.seatMap[this.users[socketId].id].table].users[this.seatMap[this.users[socketId].id].seat] = {};
            this.lobby[this.seatMap[this.users[socketId].id].table].userCount--;
            delete this.seatMap[this.users[socketId].id];
        }
    }
}
