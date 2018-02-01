import { Card } from '../../../shared/model';

export class User {
    constructor(private name: string) {}

    public heldCards: Card[] = [];
    public socketId: any;
}