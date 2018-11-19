import { Card, GameType } from "../../../../shared/model";
import {Player} from "../../model";
import { Hand } from "../baseGame/hand";
import { Match } from "../baseGame/match";
import { EuchreHand } from "./euchreHand";

export class EuchreMatch extends Match {
    constructor() {
        super();
    }

    public GetDeck(): any {
        this.shuffler = require("shuffle");

        const deck = this.shuffler.shuffle();
        deck.cards = deck.cards.filter ((card: Card) => card.sort > 8);

        return deck;
    }

    public GetHand(players: Player[], tableChan: SocketIO.Namespace): Hand {
        return new EuchreHand(players, this.deck, tableChan);
    }
}
