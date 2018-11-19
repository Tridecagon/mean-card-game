import { GameType } from "../../shared/model";
import { Match } from "./game/baseGame/match";
import { EuchreMatch } from "./game/euchre/euchreMatch";
import { OhHellMatch } from "./game/ohHell/ohHellMatch";
import { SkatMatch } from "./game/skat/skatMatch";

export class Factory {

    public static buildMatch(gameType: GameType): Match {
        switch (gameType) {
            case GameType.OhHell:
                return new OhHellMatch();
            case GameType.Euchre:
                return new EuchreMatch();
            case GameType.Skat:
                return new SkatMatch();
            default:
                return new Match();
        }
    }
}
