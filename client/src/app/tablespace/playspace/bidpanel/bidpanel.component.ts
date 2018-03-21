import { Component, OnInit, Input } from '@angular/core';
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
  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

}
