export interface Card { readonly suit: string, readonly description: string, readonly sort: number};

export namespace Card {
    export function matches(c1: Card, c2: Card): boolean {
        return c1.suit === c2.suit && c1.description === c2.description;
    }
}