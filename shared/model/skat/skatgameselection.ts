import { Card, Suit } from '..';
import { SkatGameType } from '.';

export interface SkatGameSelection {
    selection: SkatGameType;
    declarations:
    {
        schneider: boolean,
        schwarz: boolean
    }
    turnCard?: Card;
    suit?: Suit;
    doubleTurn?: boolean;
}