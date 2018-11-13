export class SkatUtil {
    
    public static readonly invalidBids: Number[] = [11, 13, 17, 19, 23, 26, 29, 31, 34, 37, 39, 41, 43, 46, 47, 51, 52, 53, 57, 58, 59];

    static isInvalidBid(bid: number) : boolean {
        return bid < 0 || !Number.isInteger(bid) || this.invalidBids.some((b) => b === bid);
    }
}