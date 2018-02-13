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


    constructor() {
        //this.dummySetup();
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
                        this.users[socket.id] = m.from;
                        this.io.emit('lobbyState', this.lobby);
                        break;
                    case Action.LEFT:
                        delete this.users[socket.id];
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
                console.log(socket.id + ' request to sit at table ' + seatLoc.table + ' seat ' + seatLoc.seat);
                this.lobby[seatLoc.table].users[seatLoc.seat] = this.users[socket.id];
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
    private dummySetup() {
        let nullUser: User = {id: null, name: null,  avatar: null}
        let dummyUser1: User = {id: 123, name: 'dummyBob', avatar: null}
        let dummyUser2: User = {id: 123, name: 'dummyAmy', avatar: null}
        this.lobby = [{users: [nullUser, dummyUser1, nullUser, nullUser]}, {users: [dummyUser2, nullUser, nullUser, dummyUser1]}]
    }

    private tableSetup() {
        for (let i = 0; i < this.maxTables; i++) {
            let emptyTable: Table = {users: [{}, {}, {}, {}]};
            this.lobby.push(emptyTable);
        }
    }
}
