import * as socketIo from 'socket.io';
import {Player} from './model';
import {Card} from '../../shared/model';

export class GameTable {
    private deck: any;
    private shuffler: any;
    private tableChan: SocketIO.Namespace;
    
    constructor(private players: Player[], private tableId: number, private tablechan: SocketIO.Namespace) {
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


            socket.on('playRequest', (card: Card) => {
                console.log(socket.id + ' request to play ' + card.suit + ' ' + card.description);
                this.tableChan.emit('playResponse', card);
            });
        }
    }

    
}