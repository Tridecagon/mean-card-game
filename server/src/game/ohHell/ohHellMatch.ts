import { Hand } from "../baseGame/hand";
import { Match } from "../baseGame/match";
import { OhHellHand } from "../ohHell/ohHellHand";

export class OhHellMatch extends Match {
    public numCards = 10;

    constructor() {
        super();
    }

    public GetHand(): Hand {
        return new OhHellHand(this.players, this.deck, this.io, this.tableChan);
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
