import { Server } from "socket.io";
import { Card, GameType, Score } from "../../../../shared/model";
import {Player} from "../../model";
import { Hand } from "../baseGame/hand";

export class EuchreHand extends Hand {
    constructor(players: Player[], deck: any, protected io: Server, protected tableChan: string) {
        super(players, deck, io, tableChan);
        this.numCards = 5;
    }
}
