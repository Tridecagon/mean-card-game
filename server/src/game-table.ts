import * as socketIo from 'socket.io';
import { Player } from './model';
import { Card, GameType } from '../../shared/model';
import { EventEmitter } from 'events';
import { Factory } from '.';
import { Match } from './game/baseGame/match';

export class GameTable {
    
    // design decision: this class shouldn't know anything about which game is being played at the table. It handles basic functions of the play area.

    private lock: any;
    private matchActive: boolean;
    public gameTableEventEmitter: EventEmitter;
    public match: Match;
    
    constructor(private players: Player[], private tableId: number, private gameType: GameType, private tableChan: SocketIO.Namespace) {
        var asyncLock = require('async-lock');
        this.lock = new asyncLock();
        this.gameTableEventEmitter = new EventEmitter();
        this.startSession();
    }


    startSession() {

        // wait for players to connect
        this.tableChan.on('connect', (socket: any)=> {
            //console.log('Connected client to table %s', this.tableId);
            // find player and assign appropriate socket
            for(let i = 0; i < this.players.length; i++) {
                if ( socket.id.indexOf( this.players[i].socket.id) >= 0 ) { // substring search to see if socket ID's are matching
                    
                    // console.log('Connected %s to table %s', this.players[i].user.name, this.tableId);
                    this.lock.acquire('key', () => {
                        this.players[i].socket = socket;
                        this.players[i].index = i;

                        this.tableChan.emit('playerSat', { 'user': this.players[i].user, 'index': i});

                        this.players[i].connected = true;
                    });
                }
            }

            socket.on('disconnect', () => {
                for(let i = 0; i < this.players.length; i++) {   // TODO: refactor this approach
                    if ( socket.id.indexOf( this.players[i].socket.id) >= 0 ) { // substring search to see if socket ID's are matching
                        this.players[i].connected = false;
                        if(this.players.every(p => !p.connected)) {
                            // reset table
                            this.tableChan.removeAllListeners();
                            this.gameTableEventEmitter.emit('end');
                        }
                    }
                }
            });

            socket.on('requestTableInfo', () => {
                this.lock.acquire('key', () => {
                    // console.log(`Entering locked section for ${this.players[i].user.name}`);
                    socket.emit('numPlayers', this.players.length);

                    // share connected players
                    for(let sittingPlayer of this.players.filter(p => p.connected))
                    {
                        // console.log(`Sent ${sittingPlayer.user.name} for ${this.players[i].user.name} at index ${sittingPlayer.index}`);
                        socket.emit('playerSat', { 'user': sittingPlayer.user, 'index': sittingPlayer.index});
                    }
                    

                    let player = this.players.find(p => p.socket.id === socket.id);
                    if (player) {
                        player.ready = true;
                        
                        if(!this.matchActive && this.players.every(p => p.ready)) {
                            this.matchActive = true;

                            this.match =  Factory.buildMatch(this.gameType);
                            this.match.beginMatch(this.players, this.tableChan);
                        }
                    }
                    // console.log(`Leaving locked section for ${this.players[i].user.name}`);
                });

            });
        });


        // }
    }
}