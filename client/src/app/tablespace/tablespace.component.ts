import { Component, OnInit, Input } from '@angular/core';
import {UiCard } from '../shared/model/uiCard';
import { Card, Message, User } from '../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';


@Component({
  selector: 'mcg-tablespace',
  templateUrl: './tablespace.component.html',
  styleUrls: ['./tablespace.component.css'],
  providers: [ SocketService ]
})

export class TablespaceComponent implements OnInit {

  @Input() user: User;

  inGame = false;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.setupListeners();
    // setupListeners instead if any are required
  }

  private setupListeners(): void {
    this.socketService.initSocket();
    this.socketService.onAction<number>('startTable')
      .subscribe((tableId) => {
        this.inGame = true;
        // TODO: separate sockets (namespace) for each table

      });
  }
}
