import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {UiCard } from '../../../shared/model/uiCard';
import { Card, Message, User } from '../../../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';
import { EventEmitter } from 'protractor';

@Component({
  selector: 'mcg-bidpanel',
  templateUrl: './bidpanel.component.html',
  styleUrls: ['./bidpanel.component.css']
})
export class BidpanelComponent implements OnInit, OnChanges {

  @Input() trumpCard: Card;
  @Input() users: User[];
  @Input() me: User;
  @Input() dealerId: number;
  @Input() maxBid = 10;
  private trumpUiCard: UiCard;
  private displayedColumns = ['col'];
  private players: User[] = [];

  private bids: number[] = [];
  private totalTricks: number;
  private totalBid: number;
  private hasBid = false;
  private turnIndex: number;
  private bidFormControls: FormControl[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.setupListeners();

    this.trumpUiCard = new UiCard(this.trumpCard);

    this.players = [];
    const dealerIndex = this.users.findIndex(u => u && u.id === this.dealerId);

    // iterate through circular array
    // for (let i = (dealerIndex + 1) % this.users.length; i === dealerIndex; i = (i + 1) % this.users.length) {
    let i = dealerIndex;
    do {
      i = (i + 1) % this.users.length;
      if (this.users[i] && this.users[i].id) {
        this.players.push(this.users[i]);
        this.bidFormControls.push(new FormControl('', [this.validateBid.bind(this)]));
      }
    } while (i !== dealerIndex);

    this.turnIndex = 0;
  }

  ngOnChanges() {


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

  sendBid(event: any) {
    if (this.canBid(this.me)) {
      const bidVal = this.ParseBid(event.target.value);
      if (bidVal >= 0) {
        this.socketService.sendAction('bidRequest', {'bid': bidVal});
      }
      event.target.value = '';
    }
  }

  validateBid(c: FormControl) {
    return (this.ParseBid(c.value) === -1) ? { validateBid: { valid: false } } : null;
  }

  ParseBid(bidStr: string): number {
    // returns -1 if error

    const bid = Number(bidStr);
    const valid = /^\d+$/.test(bidStr) && !Number.isNaN(bid) && bid >= 0 && bid <= this.maxBid;
    return valid ? bid : -1;
  }



}
