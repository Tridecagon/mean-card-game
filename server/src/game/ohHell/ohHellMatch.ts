import { Card, GameType } from "../../../../shared/model";
import {Player} from "../../model";
import { Hand } from "../baseGame/hand";
import { Match } from "../baseGame/match";
import { OhHellHand } from "../ohHell/ohHellHand";

export class OhHellMatch extends Match {
    public numCards = 10;

    constructor() {
        super();
    }

    public GetHand(players: Player[], tableChan: SocketIO.Namespace): Hand {
        return new OhHellHand(players, this.deck, tableChan);
    }

    public GetHandParams(): any {
        return {numCards: this.numCards};
    }

    public AdvanceDealer() {
        this.numCards--;
        super.AdvanceDealer();
    }

    public MatchComplete() {
        return this.numCards <= 0;
    }

}
