import { GameType } from '../../shared/model';
import { Match } from './game/baseGame/match';
import { EuchreMatch } from './game/euchre/euchreMatch';
import { OhHellMatch } from './game/ohHell/ohHellMatch';

export class Factory {

    static buildMatch(gameType: GameType) : Match {
        switch(gameType) {
            case GameType.OhHell:
                return new OhHellMatch();
            case GameType.Euchre:
                return new EuchreMatch();
            default:
                return new Match();
        }
    }
}