import {Player} from '../../model';
import { Card, GameType } from '../../../../shared/model';
import { Match } from '../baseGame/match';
import { Hand } from '../baseGame/hand';
import { EuchreHand } from './euchreHand';

export class EuchreMatch extends Match {
    constructor() {
        super();
    }

    GetDeck() : any {
        this.shuffler = require('shuffle');

        let deck = this.shuffler.shuffle();
        deck.cards = deck.cards.filter ((card : Card) => card.sort > 8);

        return deck;
    }

    GetHand(players: Player[], tableChan: SocketIO.Namespace) : Hand {
        return new EuchreHand(players, this.deck, tableChan);
    }
}