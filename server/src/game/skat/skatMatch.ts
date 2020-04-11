import { Card } from "../../../../shared/model";
import { Hand } from "../baseGame/hand";
import { Match } from "../baseGame/match";
import { SkatHand } from "./skatHand";

export class SkatMatch extends Match {
    public numCards = 10;

    constructor() {
        super();
    }

    public GetHand(): Hand {
        return new SkatHand(this.players, this.deck, this.tableChannel);
    }

    public GetDeck(): any {
        this.shuffler = require("shuffle");

        const deck = this.shuffler.shuffle();
        deck.cards = deck.cards.filter ((card: Card) => card.sort > 6);

        return deck;
    }

}
