import { Card } from '.';

export class User {
    constructor(private name: string) {}

    public heldCards: Card[] = [];
    public socketId: any;
}