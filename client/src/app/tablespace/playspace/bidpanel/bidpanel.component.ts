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
  private trumpUiCard: UiCard;
  private displayedColumns = ['col'];
  private players: User[] = [];

  private bids: number[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit() {

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

  calculateCols(): number {
    return this.players.length + 1;
  }

}
