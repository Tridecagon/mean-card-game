import { SkatGameType } from '.';

export interface SkatGameSelection {
    selection: SkatGameType;
    declarations:
    {
        schneider: boolean,
        schwarz: boolean
    }
}