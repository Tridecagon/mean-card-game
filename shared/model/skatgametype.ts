export enum SkatGameType {
    Turn,
    Clubs,
    Spades,
    Hearts,
    Diamonds,
    Grand,
    GrandOvert,
    Guetz,
    Ramsch,
    Null,
    NullOvert
}

export namespace SkatGameType {

    export function values() {
      return Object.keys(SkatGameType).filter(
        (type) => isNaN(<any>type) && type !== 'values'
      );
    }
  }