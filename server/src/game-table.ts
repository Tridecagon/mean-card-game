import * as socketIo from 'socket.io';
import {Player} from './model';
import {Card} from '../../shared/model';

export class GameTable {
    private deck: any;
    private shuffler: any;
    
    constructor(private players: Player[], private tableId: number, private tableChan: SocketIO.Namespace) {
        this.startGame();
    }

    startGame() {
        // TODO: move this to Deal class
        this.shuffler = require('shuffle');
        this.deck = this.shuffler.shuffle();

        for( let player of this.players ) {
            const socket = player.socket;

            console.log(`Dealing hand to player ${player.user.name} socket ${socket.id}`);
            var newHand = this.deck.draw(10);
            socket.emit('dealHand', newHand);
            player.heldCards = newHand;
            this.tableChan.emit('dealCards', {numCards: 10, toUser: player.user.id});


            socket.on('playRequest', (card: Card) => {
                console.log(socket.id + ' request to play ' + card.suit + ' ' + card.description);
                this.tableChan.emit('playResponse', card);
            });
        }
    }

    
}