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

  private tiles = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 3, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 2, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 2, color: '#DDBDF1'},
  ];

  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.trumpUiCard = new UiCard(this.trumpCard);
    this.userStack[0] = this.users;
  }

  calculateCols(): number {
    return 4;
  }

}
