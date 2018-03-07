
import {Player} from '../../model';
import { Card, GameType } from '../../../../shared/model';

export class Match {
    
    protected deck: any;
    protected shuffler: any;
    protected type: GameType;
    protected numCards: number;

    constructor() {
        this.type = GameType.Base;
        this.numCards = 13;
    }

    beginMatch(players: Player[], tableChan: SocketIO.Namespace) {
        this.deck = this.GetDeck();
        for(let player of players) {
            console.log(`Dealing hand to player ${player.user.name} socket ${player.socket.id}`);
            var newHand = this.deck.draw(this.numCards);
            for(let card of newHand) {
                player.heldCards.push({'suit': card.suit, 'description': card.description, 'sort': card.sort});
            }
            player.socket.emit('dealHand', player.heldCards);
            tableChan.emit('tableDealCards', {numCards: this.numCards, toUser: player.user.id});


            player.socket.on('playRequest', (card: Card) => {
                console.log(player.user.name + ' request to play ' + card.suit + ' ' + card.description);
                let playCard = player.heldCards.find(c => (c.suit === card.suit && c.description === card.description));
                if (playCard) { // TODO: check if player's turn
                    tableChan.emit('playResponse', {'card': card, 'userId': player.user.id});
                    player.heldCards.splice(player.heldCards.indexOf(playCard), 1);
                }
            });
        }
    }

    GetDeck() : any {
        this.shuffler = require('shuffle');
        return this.shuffler.shuffle();
    }
}