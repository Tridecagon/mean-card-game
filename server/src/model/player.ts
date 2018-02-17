import { Card, User } from '../../../shared/model';

export class Player {
    constructor(private user: User) {}

    public socketId: any;
    public heldCards?: Card[] = [];
}