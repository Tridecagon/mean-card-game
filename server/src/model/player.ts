import { Card, User } from '../../../shared/model';

export class Player {
    public heldCards?: Card[] = [];
    public trickPile?: Card[] = [];
    public connected = false;
    public ready = false;
    public index: number;

    constructor(public user: User, public socket: SocketIO.Socket) {}


}