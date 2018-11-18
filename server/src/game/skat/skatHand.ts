import { Player } from '../../model';
import { Card, GameType, Score, SkatUtil, SkatGameSelection, SkatGameType } from '../../../../shared/model';
import { Hand, State } from '../baseGame';

export class SkatHand extends Hand {

    private skat: Card[] = [];
    private bids: number[] = [];
    private whoseBid: number; // 0 is hold, 1 is middle, 2 is rear
    private holdIndex: number;
    private selectedGame: SkatGameSelection;
    private winningBid: number;

    constructor(players: Player[], deck: any, tableChan: SocketIO.Namespace) {
        super(players, deck, tableChan);
        
    }

    DealHands() {
        this.skat = this.deck.draw(2);
        this.numCards = 10;
        super.DealHands();
    }

    CollectCards() {
        if(this.skat) {
            this.ReturnToDeck(this.skat);
        }
        super.CollectCards();
    }
    SetupStateHandlers() {
        this.stateHandlers[State.Bid] = () => {
            this.bids = [-1, -1, -1];
            this.whoseBid = 1;
            this.holdIndex = (this.dealerIndex + 1) % this.players.length;
            this.currentPlayer = (this.holdIndex + 1) % this.players.length;
            this.tableChan.emit('startBidding', {'gameType': 'Skat', 'dealerId': this.players[this.dealerIndex].user.id});
        };
    }

    // TODO: this is wrong, fix
    // note: Pass is a bid of 0
    ProcessBid(player: Player, bidInfo: any) : boolean {
        
        const bidVal : number = Number(bidInfo.bid);
        if(this.ValidBid(player, bidVal)) {
            this.bids[this.whoseBid] = bidVal;
            if(!this.SetNextBidder(bidInfo))
                // TODO: set state to Choose Game
                this.CompleteBidding();
            bidInfo.currentPlayer = this.currentPlayer;
            return true;
        }
        return false;
    }
    // returns true if bidding is still going
    // TODO: unit test this
    SetNextBidder(bidInfo: any): boolean {
        if(this.bids[0] === -1 && this.bids[1] === 0 && this.bids[2] === 0) { // hold wins by default; ramsch possible
            this.winningBid = this.bids[0] = 5;
            this.currentPlayer = this.holdIndex;
            return false;
        }

        if(this.bids.filter((b) => b === 0).length === 2) {// two people have passed, bidding is over
            let winnerIndex = this.bids.findIndex((b) => b > 0);
            this.currentPlayer = (this.holdIndex + winnerIndex) % this.players.length;
            this.winningBid = this.bids[winnerIndex];
            return false;
        }

        var newBidder: number; // 0 is hold
        if(bidInfo.bid === 0) // current bid is the first pass, bring 3rd player into bidding
            newBidder = 2;
        else { // first person who hasn't passed and isn't the current bidder
            newBidder = this.bids.findIndex((b, i) => b !== 0 && i !== this.whoseBid);
        }
        
        bidInfo.mode = (newBidder > this.whoseBid) ? "bid" : "respond";
        this.whoseBid = newBidder;
        this.currentPlayer = (this.holdIndex + this.whoseBid) % this.players.length;
        bidInfo.nextBidder = this.whoseBid;
        return true;  
    }

    ValidBid(player: Player, bidVal: number) : boolean {
        // check turn
        if(player.index !== (this.holdIndex + this.whoseBid) % this.players.length)
            return false;

        // check valid bid
        // is this a pass?
        if(bidVal === 0) {
            return true;
        }

        // is there a higher bid?
        if(this.bids.some((b) => b > bidVal))
            return false;

        // is there an equal bid from an earlier player?
        if(this.bids.some((b, i) => b === bidVal && i < this.whoseBid))
            return false;
        
        // is the bid number valid?
        if(SkatUtil.invalidBids.some((b) => b === bidVal) || bidVal < 10)
            return false;
        return true;
    }

    GetSuit(card: Card) : string {
        switch(this.trumpSuit)
        {
            case "Null":
                return card.suit;
            case "Jacks":
                return card.description === "Jack" ? "Jacks" : card.suit;
            default:
                return card.description === "Jack" ? this.trumpSuit : card.suit;
        }
    }

    GetSort(card: Card) : number {
        switch(this.trumpSuit)
        {
            case "Null":
                return card.sort;
            default:
                switch(card.sort)
                {
                    case 10:
                        return 13.5;
                    // Jacks in order
                    case 11:
                        switch(card.suit)
                        {
                            case "Diamond":
                                return 15;
                            case "Heart":
                                return 16;
                            case "Spade":
                                return 17;
                            case "Club":
                                return 18;
                            default:
                                throw Error("Broken ass case statement");
                        }
                    default:
                        return card.sort;
                }
        }
    }

    CompleteBidding() {
        console.log(`Bidding complete. Winning bidder: ${this.players[this.currentPlayer].user.name}, bid: ${this.winningBid}`);
        this.tableChan.emit('biddingComplete', 
        { winner: this.currentPlayer,
            bid: this.winningBid
        });
        this.players[this.currentPlayer].socket.on('selectGame', (selectedGame: SkatGameSelection) =>
        {
            if(this.winningBid === 5 || selectedGame.selection !== SkatGameType.Ramsch) {
                this.selectedGame = selectedGame;
                // TODO: add turn
                this.tableChan.emit('gameSelected', selectedGame );
            }
        });
    }

    // TODO: this is from a different game, fix
    ScoreHand() {
        this.scores = [];
        for(let player of this.players) {
            const numTricks = player.trickPile.length / this.players.length;
            this.scores[player.index] = {
                points: (numTricks + (this.bids[player.index] === numTricks ? 10 : 0)),
                id: player.user.id};
        }
    }
}