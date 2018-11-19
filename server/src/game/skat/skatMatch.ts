import { Card, GameType } from "../../../../shared/model";
import {Player} from "../../model";
import { Hand } from "../baseGame/hand";
import { Match } from "../baseGame/match";
import { SkatHand } from "./skatHand";

export class SkatMatch extends Match {
    public numCards = 10;

    constructor() {
        super();
    }

    public GetHand(players: Player[], tableChan: SocketIO.Namespace): Hand {
        return new SkatHand(players, this.deck, tableChan);
    }

    public GetDeck(): any {
        this.shuffler = require("shuffle");

        const deck = this.shuffler.shuffle();
        deck.cards = deck.cards.filter ((card: Card) => card.sort > 6);

        return deck;
    }

}
