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
  private userStack: User[][] = [];
  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.trumpUiCard = new UiCard(this.trumpCard);
    this.userStack[0] = this.users;
  }

}
