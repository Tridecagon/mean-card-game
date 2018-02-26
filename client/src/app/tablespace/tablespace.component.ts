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
  topUser: User;
  rightUser: User;
  leftUser: User;

  inGame = false;
  numPlayers = 0;
  userIndex = -1;

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
        this.socketService.setNamespace(`/table${tableId}`);
        this.setupTableListeners();
        this.socketService.sendAction('requestTableInfo', null);
      });

  }

  private setupTableListeners(): void {
    this.socketService.onAction<number>('numPlayers')
    .subscribe((numPlayers) => {
      this.numPlayers = numPlayers;
    });

    this.socketService.onAction<any>('playerSat')
    .subscribe((sittingUser) => {
      if (sittingUser.user.id === this.user.id) { // it's me!
        this.userIndex = sittingUser.index;
      } else { // where do I put the new guy?
        switch (this.numPlayers) {
          case 2:
            this.topUser = sittingUser.user;
            break;
          case 3:
            if ((this.userIndex + 1) % 3 === sittingUser.index) {
              this.leftUser = sittingUser.user;
            } else {
              this.rightUser = sittingUser.user;
            };
            break;
          case 4:
            if ((this.userIndex + 1) % 4 === sittingUser.index) {
              this.leftUser = sittingUser.user;
            } else if ((this.userIndex + 2) % 4 === sittingUser.index) {
              this.topUser = sittingUser.user;
            } else {
              this.rightUser = sittingUser.user;
            };
            break;
        }
      }
    });
  }
}
