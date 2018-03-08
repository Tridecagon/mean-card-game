import {Player} from '../../model';
import { Card, GameType, Score } from '../../../../shared/model';

export class Hand {
    
    protected numCards: number;

    constructor(protected players: Player[], protected deck: any, protected tableChan: SocketIO.Namespace) {
        this.numCards = 10;
    }

    Play(dealerIndex: number) : Score[] {
        for(let player of this.players) {
            console.log(`Dealing hand to player ${player.user.name} socket ${player.socket.id}`);
            var newHand = this.deck.draw(this.numCards);
            for(let card of newHand) {
                player.heldCards.push({'suit': card.suit, 'description': card.description, 'sort': card.sort});
            }
            player.socket.emit('dealHand', player.heldCards);
            this.tableChan.emit('tableDealCards', {numCards: this.numCards, toUser: player.user.id});


            player.socket.on('playRequest', (card: Card) => {
                console.log(player.user.name + ' request to play ' + card.suit + ' ' + card.description);
                let playCard = player.heldCards.find(c => (c.suit === card.suit && c.description === card.description));
                if (playCard) { // TODO: check if player's turn
                    this.tableChan.emit('playResponse', {'card': card, 'userId': player.user.id});
                    player.heldCards.splice(player.heldCards.indexOf(playCard), 1);
                }
            });
        }
        return [];
    }
}