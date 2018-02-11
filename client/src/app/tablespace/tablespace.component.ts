import { Component, OnInit, Input } from '@angular/core';
import {UiCard } from '../shared/model/uiCard';
import { Card, Message, User } from '../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';


@Component({
  selector: 'mcg-tablespace',
  templateUrl: './tablespace.component.html',
  styleUrls: ['./tablespace.component.css']
})

export class TablespaceComponent implements OnInit {

  @Input() user: User;

  inGame = false;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.socketService.initSocket();
    // setupListeners instead if any are required
  }

  onDealClick() {
      this.inGame = true;
      this.socketService.sendAction('dealRequest', '');
  }
}
