export enum GameType {
    Euchre,
    OhHell,
    Skat
}

export namespace GameType {

    export function values() {
      return Object.keys(GameType).filter(
        (type) => isNaN(<any>type) && type !== 'values'
      );
    }
  }