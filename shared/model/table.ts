import { User } from './user';
import { GameType } from './gametype';

export interface Table {
    users: User[];
    active: boolean;
    userCount: number;
    gameType: GameType;
}
