import { Card } from '../../../shared/model';
import { User } from '../../../shared/model';

export class Player {
    constructor(private user: User) {}

    public heldCards: Card[] = [];
}