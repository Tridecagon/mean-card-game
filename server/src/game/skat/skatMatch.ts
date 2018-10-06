import {Player} from '../../model';
import { Card, GameType } from '../../../../shared/model';
import { Match } from '../baseGame/match';
import { Hand } from '../baseGame/hand';
import { SkatHand } from './skatHand';

export class SkatMatch extends Match {
    numCards = 10;

    constructor() {
        super();
    }


    GetHand(players: Player[], tableChan: SocketIO.Namespace) : Hand {
        return new SkatHand(players, this.deck, tableChan);
    }

    GetDeck() : any {
        this.shuffler = require('shuffle');

        let deck = this.shuffler.shuffle();
        deck.cards = deck.cards.filter ((card : Card) => card.sort > 6);

        return deck;
    }

}