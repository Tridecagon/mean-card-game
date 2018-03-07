import { GameType } from '../../shared/model';
import { Match } from './game/baseGame/match';
import { EuchreMatch } from './game/euchre/euchreMatch';

export class Factory {

    static buildMatch(gameType: GameType) : Match {
        switch(gameType) {
            case GameType.OhHeck:
                //return new OhHeckMatch();
                break;
            case GameType.Euchre:
                return new EuchreMatch();
            default:
                return new Match();
        }
    }
}