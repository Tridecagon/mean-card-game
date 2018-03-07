import { GameType } from '../../shared/model';
import { Match } from './baseGame/match';

export class Factory {

    static buildMatch(gameType: GameType) : Match {
        switch(gameType) {
            case GameType.OhHeck:
                //return new OhHeckMatch();
                break;
            default:
                return new Match();
        }
    }
}