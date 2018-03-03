import { User } from './user';

export interface Table {
    users: User[];
    active: boolean;
    userCount: number;
}
