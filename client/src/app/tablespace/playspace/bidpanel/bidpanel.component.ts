import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {UiCard } from '../../../shared/model/uiCard';
import { Card, Message, User } from '../../../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';

@Component({
  selector: 'mcg-bidpanel',
  templateUrl: './bidpanel.component.html',
  styleUrls: ['./bidpanel.component.css']
})
export class BidpanelComponent implements OnInit, OnChanges {

  @Input() trumpCard: Card;
  @Input() users: User[];
  @Input() me: User;
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
  }

  ngOnChanges() {
    this.trumpUiCard = new UiCard(this.trumpCard);

    this.players = [];
    for (const user of this.users) {
      if (user && user.id) {
        this.players.push(user);
      }
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
    this.socketService.sendAction('bidRequest', {'bid': event.target.valueAsNumber})
  }

}
