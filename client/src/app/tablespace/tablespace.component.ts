import { Component, OnInit, Input } from '@angular/core';
import {UiCard } from '../shared/model/uiCard';
import { User } from '../shared/model/user';
import { Card } from '../../../../shared/model/card';
import { Message } from '../shared/model/message';
import { SocketService } from 'app/shared/services/socket.service';


@Component({
  selector: 'mcg-tablespace',
  templateUrl: './tablespace.component.html',
  styleUrls: ['./tablespace.component.css']
})

export class TablespaceComponent implements OnInit {

  @Input() user: User;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.socketService.initSocket();
    // setupListeners instead if any are required
  }

  onDealClick() {
      this.socketService.sendAction('dealRequest', '');
  }
}
