import { Match } from "../baseGame/match";
import { Card, GameType } from "../../../../shared/model";

export class EuchreMatch extends Match {
    constructor() {
        super();
        this.type = GameType.Euchre;
        this.numCards = 5;
    }

    GetDeck() : any {
        this.shuffler = require('shuffle');

        let deck = this.shuffler.shuffle();
        deck.cards = deck.cards.filter ((card : Card) => card.sort > 8);

        deck.shuffle(); // why not?
        return deck;
    }
}