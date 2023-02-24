import { Namespace } from "socket.io";
import { Card, GameType, Score } from "../../../../shared/model";
import {Player} from "../../model";
import { Hand } from "../baseGame/hand";

export class EuchreHand extends Hand {
    constructor(players: Player[], deck: any, tableChan: Namespace) {
        super(players, deck, tableChan);
        this.numCards = 5;
    }
}
