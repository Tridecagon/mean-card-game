import { Card, User } from '../../../shared/model';

export class Player {
    constructor(public user: User, public socket: SocketIO.Socket) {}


    public heldCards?: Card[] = [];
}