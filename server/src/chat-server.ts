import { Action } from '../../shared/model/action';
import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import { Card, Message, User, Table } from '../../shared/model';

export class ChatServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    private shuffler: any;
    private deck: any;
    private maxTables = 5;

    private hand: Card[] = [];
    private users: User[] = [];
    private lobby: Table[] = [];
    private seatMap: {table: number, seat: number}[] = [];


    constructor() {
        this.tableSetup();
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();

        this.shuffler = require('shuffle');
        this.deck = this.shuffler.shuffle();
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
                        break;
                    case Action.RENAME:
                        let seatLoc = this.seatMap[(this.users[socket.id]).id];
                        this.users[socket.id] = m.from;
                        this.lobby[seatLoc.table].users[seatLoc.seat] = this.users[socket.id];
                        this.io.emit('lobbyState', this.lobby);
                        break;
                    case Action.LEFT:
                        this.unseatUser(socket.id);
                        delete this.users[socket.id];
                        this.io.emit('lobbyState', this.lobby);
                        break;
                    default:
                        break;
                }
                this.io.emit('chatMessage', m);
            });

            socket.on('dealRequest', () => {
                console.log('Dealing hand to socket ' + socket.id);
                // temporary  reclaim deck
                this.deck = this.shuffler.shuffle();
                var newHand = this.deck.draw(10);
                // console.log(newHand);

                socket.emit('dealResponse', newHand);
            });

            socket.on('playRequest', (card: Card) => {
                console.log(socket.id + ' request to play ' + card.suit + ' ' + card.description);
                this.io.emit('playResponse', card);
            });

            socket.on('requestSeat', (seatLoc: {table: number, seat: number}) => {
                this.unseatUser(socket.id);

                this.lobby[seatLoc.table].users[seatLoc.seat] = this.users[socket.id];
                this.seatMap[this.users[socket.id].id] = seatLoc;
                this.io.emit('lobbyState', this.lobby);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

    private tableSetup() {
        for (let i = 0; i < this.maxTables; i++) {
            let emptyTable: Table = {users: [{}, {}, {}, {}]};
            this.lobby.push(emptyTable);
        }
    }

    private unseatUser(socketId: any) {
        if (this.seatMap[(this.users[socketId]).id]) {
            this.lobby[this.seatMap[this.users[socketId].id].table].users[this.seatMap[this.users[socketId].id].seat] = {};
            delete this.seatMap[this.users[socketId].id];
        }
    }
}
