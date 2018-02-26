import * as socketIo from 'socket.io';
import {Player} from './model';
import {Card} from '../../shared/model';

export class GameTable {
    private deck: any;
    private shuffler: any;
    private lock: any;
    
    constructor(private players: Player[], private tableId: number, private tableChan: SocketIO.Namespace) {
        var asyncLock = require('async-lock');
        this.lock = new asyncLock();
        this.startSession();
    }

    startSession() {
        // TODO: move this to Deal class
        this.shuffler = require('shuffle');
        this.deck = this.shuffler.shuffle();

        // wait for players to connect
        this.tableChan.on('connect', (socket: any)=> {
            //console.log('Connected client to table %s', this.tableId);
            // find player and assign appropriate socket
            for(let i = 0; i < this.players.length; i++) {
                if ( socket.id.indexOf( this.players[i].socket.id) >= 0 ) { // substring search to see if socket ID's are matching
                    
                    // console.log('Connected %s to table %s', this.players[i].user.name, this.tableId);
                    this.players[i].socket = socket;
                    this.players[i].index = i;

                    this.lock.acquire('key', () => {
                        // console.log(`Entering locked section for ${this.players[i].user.name}`);
                        socket.emit('numPlayers', this.players.length);

                        // share connected players
                        this.tableChan.emit('playerSat', { 'user': this.players[i].user, 'index': i});
                        for(let sittingPlayer of this.players.filter(p => p.connected))
                        {
                            // console.log(`Sent ${sittingPlayer.user.name} for ${this.players[i].user.name} at index ${sittingPlayer.index}`);
                            socket.emit('playerSat', { 'user': sittingPlayer.user, 'index': sittingPlayer.index});
                        }
                        
                        this.players[i].connected = true;
                        
                        // console.log(`Leaving locked section for ${this.players[i].user.name}`);
                    });



                    if(this.players.every(p => p.connected)) {
                        this.beginMatch();
                    }
                }
            }
        });


        // }
    }

    beginMatch() {
        for(let player of this.players) {
            console.log(`Dealing hand to player ${player.user.name} socket ${player.socket.id}`);
            var newHand = this.deck.draw(10);
            player.socket.emit('dealHand', newHand);
            player.heldCards = newHand;
            this.tableChan.emit('tableDealCards', {numCards: 10, toUser: player.user.id});


            player.socket.on('playRequest', (card: Card) => {
                console.log(player.user.name + ' request to play ' + card.suit + ' ' + card.description);
                this.tableChan.emit('playResponse', card);
            });
        }
    }
}