import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {UiCard } from '../../../shared/model/uiCard';
import { Card, Message, User } from '../../../../../../shared/model';
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
  @Input() maxBid = 10;
  trumpUiCard: UiCard;
  displayedColumns = ['col'];
  players: User[] = [];
  me: User;

  bids: number[] = [];
  bidsComplete = false;
  totalTricks: number;
  totalBid: number;
  hasBid = false;
  turnIndex: number;
  bidFormControls: FormControl[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.setupListeners();

    this.trumpUiCard = new UiCard(this.trumpCard);

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
  }

  setupListeners() {
    this.socketService.initSocket();

    this.socketService.onAction<any>('bidResponse')
        .subscribe((bidData) => {
          const index = this.players.findIndex(p => p.id === bidData.userId);
          this.bids[index] = bidData.bidInfo.bid;
          this.totalTricks = bidData.bidInfo.totalTricks;
          this.totalBid = bidData.bidInfo.totalBid;
          this.turnIndex = index + 1;
          if (bidData.userId === this.me.id) {
            this.hasBid = true;
          }
          if (this.turnIndex === this.players.length) {
            this.bidsComplete = true;
          }
        });
  }

  calculateCols(): number {
    return this.players.length + 1;
  }

  canBid(player: User): boolean {
    return this.isMe(player) && !this.hasBid;
  }

  isMe(player: User): boolean {
    return this.me.id === player.id;
  }

  validateBid(c: FormControl) {
    return (this.ParseBid(c.value) === -1) ? { validateBid: { valid: false },
      errorMsg: `Enter a bid between 0 and ${this.maxBid}` } : null;
  }

  checkBidTotal(c: FormControl) {
    return (this.me.id === this.dealerId
            && (this.totalBid + this.ParseBid(c.value) === this.totalTricks))
       ? { totalBid: { valid: false } , errorMsg: `Dealer cannot bid ${this.totalTricks - this.totalBid}` } : null;
  }

  ParseBid(bidStr: string): number {
    // returns -1 if error

    const bid = Number(bidStr);
    const valid = /^\d+$/.test(bidStr) && !Number.isNaN(bid) && bid >= 0 && bid <= this.maxBid;
    return valid ? bid : -1;
  }



}
