import * as socketIo from 'socket.io';
import {Player} from './model';
import {Card} from '../../shared/model';

export class GameTable {
    private deck: any;
    private shuffler: any;
    private lock: any;
    private matchActive: boolean;
    
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
                    this.lock.acquire('key', () => {
                        this.players[i].socket = socket;
                        this.players[i].index = i;

                        this.tableChan.emit('playerSat', { 'user': this.players[i].user, 'index': i});

                        this.players[i].connected = true;
                    });
                }
            }

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
                    
                    // console.log(`Leaving locked section for ${this.players[i].user.name}`);

                    let player = this.players.find(p => p.socket.id === socket.id);
                    if (player) {
                        player.ready = true;
                        
                        if(!this.matchActive && this.players.every(p => p.ready)) {
                            this.matchActive = true;
                            this.beginMatch();
                        }
                    }


                });

            });
        });


        // }
    }

    beginMatch() {
        for(let player of this.players) {
            console.log(`Dealing hand to player ${player.user.name} socket ${player.socket.id}`);
            var newHand = this.deck.draw(10);
            for(let card of newHand) {
                player.heldCards.push({'suit': card.suit, 'description': card.description, 'sort': card.sort});
            }
            player.socket.emit('dealHand', player.heldCards);
            this.tableChan.emit('tableDealCards', {numCards: 10, toUser: player.user.id});


            player.socket.on('playRequest', (card: Card) => {
                console.log(player.user.name + ' request to play ' + card.suit + ' ' + card.description);
                let playCard = player.heldCards.find(c => (c.suit === card.suit && c.description === card.description));
                if (playCard) { // TODO: check if player's turn
                    this.tableChan.emit('playResponse', {'card': card, 'userId': player.user.id});
                    player.heldCards.splice(player.heldCards.indexOf(playCard), 1);
                }
            });
        }
    }
}