import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {UiCard } from '../../shared/model/uiCard';
import { Card, Message, User } from '../../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';

@Component({
  selector: 'mcg-playspace',
  templateUrl: './playspace.component.html',
  styleUrls: ['./playspace.component.css'],
  providers: [SocketService]
})
export class PlayspaceComponent implements OnInit {

  trumpCard: Card;
  _user: User;
  users: User[] = [];
  zIndexes: number[] = [];
  bidding: boolean;
  selectingGame: boolean;
  dealerId: number;
  gameType: string;

  numPlayers = 0;
  userIndex = -1;
  currentZIndex = 5;

  @Input() tableId: number;
  @Input()
  set user(user: User) {
    this.users[0] = user;
    this._user = user;
  }

  @Output() onJoinTable = new EventEmitter<{name: string, conn: SocketService}>();

  constructor(private socketService: SocketService) {
    this.zIndexes.fill(this.currentZIndex, 0, 3);
  }

  ngOnInit() {
    this.selectingGame = false;
    this.socketService.initSocket(`/table${this.tableId}`);
    this.onJoinTable.emit({name: 'Table', conn: this.socketService});
    this.setupTableListeners();
    this.socketService.sendAction('requestTableInfo', null);
  }
  private setupTableListeners(): void {
    this.socketService.onAction<number>('numPlayers')
    .subscribe((numPlayers) => {
      this.numPlayers = numPlayers;
    });

    this.socketService.onAction<any>('playerSat')
    .subscribe((sittingUser) => {
      if (sittingUser.user.id === this._user.id) { // it's me!
        this.userIndex = sittingUser.index;
      } else { // where do I put the new guy?
        switch (this.numPlayers) {
          case 2:
            this.users[2] = sittingUser.user;
            break;
          case 3:
            if ((this.userIndex + 1) % 3 === sittingUser.index) {
              this.users[1] = sittingUser.user;
            } else {
              this.users[3] = sittingUser.user;
            }
            break;
          case 4:
            if ((this.userIndex + 1) % 4 === sittingUser.index) {
              this.users[1] = sittingUser.user;
            } else if ((this.userIndex + 2) % 4 === sittingUser.index) {
              this.users[2] = sittingUser.user;
            } else {
              this.users[3] = sittingUser.user;
            }
            break;
        }
      }
    });

    this.socketService.onAction<any>('playResponse')
    .subscribe((playInfo) => {
      for (const i in this.users) {
        if (this.users[i] && this.users[i].id === playInfo.userId) {
          this.zIndexes[i] = this.currentZIndex++;
        }
      }
    });

    this.socketService.onAction<any>('trickWon')
    .subscribe((userId) => {
      for (const i in this.users) {
        if (this.users[i] && this.users[i].id === userId) {
          this.zIndexes[i] = 10;
        }
      }
    });

    this.socketService.onAction<any>('startBidding')
    .subscribe((info) => {
        this.trumpCard = info.trumpCard;
        this.dealerId = info.dealerId;

        this.gameType = info.gameType;
        this.bidding = true;

        this.currentZIndex = 5;
        this.zIndexes.fill(this.currentZIndex, 0, 3);

        // make sure player's hand is visible
        this.zIndexes[0] = 20;

      });

      this.socketService.onAction<any>('biddingComplete')
        .subscribe((bidData) => {
          if (this.userIndex === bidData.winner) {
            this.bidding = false;
            this.selectingGame = true;
          }
        });

      this.socketService.onAction<any>('beginPlay')
      .subscribe(() => {
          this.bidding = false;
        });
  }

}
