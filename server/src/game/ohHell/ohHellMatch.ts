import {Player} from '../../model';
import { Card, GameType } from '../../../../shared/model';
import { Match } from '../baseGame/match';
import { Hand } from '../baseGame/hand';
import { OhHellHand } from '../ohHell/ohHellHand';

export class OhHellMatch extends Match {
    numCards = 10;

    constructor() {
        super();
    }


    GetHand(players: Player[], tableChan: SocketIO.Namespace) : Hand {
        return new OhHellHand(players, this.deck, tableChan);
    }

    GetHandParams() : any {
        return {numCards: this.numCards};
    }

    AdvanceDealer() {
        this.numCards--;
        super.AdvanceDealer();
    }

    MatchComplete() {
        return this.numCards <= 0;
    }

}