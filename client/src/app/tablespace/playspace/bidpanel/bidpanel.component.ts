import { Component, OnInit, Input, OnChanges } from '@angular/core';
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
  private trumpUiCard: UiCard;
  private displayedColumns = ['col'];
  private players: User[] = [];

  private bids: number[] = [];
  private totalTricks: number;
  private totalBid: number;
  private hasBid = false;

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
      }
    } while (i !== dealerIndex);
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
      this.socketService.sendAction('bidRequest', {'bid': event.target.valueAsNumber});
    }
  }

}
