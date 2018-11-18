import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {UiCard } from '../../../shared/model/uiCard';
import { Card, Message, User, SkatUtil } from '../../../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';

@Component({
  selector: 'mcg-bidpanel',
  templateUrl: './bidpanel.component.html',
  styleUrls: ['./bidpanel.component.css']
})
export class BidpanelComponent implements OnInit {

  @Input() trumpCard: Card;
  @Input() users: User[];
  @Input() dealerId: number;
  @Input() maxBid: number;
  @Input() gameType: string;
  trumpUiCard: UiCard;
  displayedColumns = ['col'];
  players: User[] = [];
  me: User;

  bids: number[] = [];
  bidsComplete = false;
  totalTricks: number;
  totalBid: number;
  turnIndex: number;
  minBid = 0;
  bidFormControls: FormControl[] = [];
  bidModes: string[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.setupListeners();

    if (this.trumpCard) {
      this.trumpUiCard = new UiCard(this.trumpCard);
    }

    this.players = [];
    this.me = this.users[0];
    const dealerIndex = this.users.findIndex(u => u && u.id === this.dealerId);

    // iterate through circular array
    // for (let i = (dealerIndex + 1) % this.users.length; i === dealerIndex; i = (i + 1) % this.users.length) {
    let i = dealerIndex;
    do {
      i = (i + 1) % this.users.length;
      if (this.users[i] && this.users[i].id) {
        this.players.push(this.users[i]);
        this.bidFormControls.push(new FormControl(this.users[i].name, [this.validateBid.bind(this), this.checkBidTotal.bind(this)]));
      }
    } while (i !== dealerIndex);

    this.turnIndex = 0;
    if (this.gameType === 'Skat') {
      this.turnIndex = 1;
      this.maxBid = -1;
      this.minBid = 10;
      this.bidFormControls[1].setValue(10);

      this.bidModes = ['respond', 'bid', 'bid'];
    }
  }

  setupListeners() {
    this.socketService.initSocket();

    this.socketService.onAction<any>('bidResponse')
      .subscribe((bidData) => {
        const index = this.players.findIndex(p => p.id === bidData.userId);
        this.bids[index] = bidData.bidInfo.bid;
        this.totalTricks = bidData.bidInfo.totalTricks;
        this.totalBid = bidData.bidInfo.totalBid;
        this.turnIndex = bidData.bidInfo.nextBidder;
        if (bidData.bidInfo.maxBid !== undefined) {
          this.maxBid = bidData.bidInfo.maxBid;
        }
        if (bidData.bidInfo.minBid !== undefined) {
          this.minBid = bidData.bidInfo.minBid;
        }
        if (bidData.bidInfo.nextBidder !== undefined) {
          this.bidModes[this.turnIndex] = bidData.bidInfo.mode;
        }
        if (this.gameType === 'Skat') {
          if (bidData.bidInfo.mode === 'respond') {
            this.bidFormControls[this.turnIndex].setValue(bidData.bidInfo.bid);
          } else if (bidData.bidInfo.mode === 'bid') {
            let nextBid = Math.max(...this.bids.map(v => v === undefined ? -1 : v)) + 1;
            while (nextBid < 10 || SkatUtil.invalidBids.some((b) => b === nextBid)) {
              nextBid++;
            }
            this.bidFormControls[this.turnIndex].setValue(nextBid);
          }
        }
        // TODO: this might break skat - implement a listener
        if (this.turnIndex === this.players.length) {
          this.bidsComplete = true;
        }
      });

      this.socketService.onAction<any>('biddingComplete')
        .subscribe((bidData) => {
          this.bidsComplete = true;
        });
  }

  calculateCols(): number {
    return this.players.length + 1;
  }

  canBid(player: User): boolean {
    return this.isMe(player) && this.turnIndex === this.players.findIndex((p) => p.id === this.me.id);
  }

  isMe(player: User): boolean {
    return this.me.id === player.id;
  }

  validateBid(c: FormControl) {
    const errorText = this.maxBid >= 0
    ? `Enter a bid between ${this.minBid} and ${this.maxBid}`
    : `Enter a valid bid of at least ${this.minBid}`;
    return (this.ParseBid(c.value) === -1) ? { validateBid: { valid: false },
      errorMsg: errorText} : null;
  }

  checkBidTotal(c: FormControl) {
    return ( this.gameType === 'Oh Hell'
            && this.me.id === this.dealerId
            && this.totalBid + this.ParseBid(c.value) === this.totalTricks)
       ? { totalBid: { valid: false } , errorMsg: `Dealer cannot bid ${this.totalTricks - this.totalBid}` } : null;
  }

  ParseBid(bidStr: string): number {
    // returns -1 if error

    const bid = Number(bidStr);
    let valid = /^\d+$/.test(bidStr) && !Number.isNaN(bid) && bid >= 0;
    if (this.maxBid >= 0 && bid > this.maxBid) {
      valid = false;
    }
    if (this.minBid >= 0 && bid < this.minBid && bid !== 0) {
      valid = false;
    }
    return valid ? bid : -1;
  }



}
