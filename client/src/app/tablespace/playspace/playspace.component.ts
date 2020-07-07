import { HandComponent } from './hand/hand.component';
import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { Card, User } from '../../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';
import { SkatGameSelection } from '../../../../../shared/model/skat';
import { MatDialog } from '@angular/material';
import { ClaimdialogComponent } from './claimdialog/claimdialog.component';
import { AcceptclaimdialogComponent } from './acceptclaimdialog/acceptclaimdialog.component';

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
  selectedGame: SkatGameSelection;
  doingTurn: boolean;
  discarding: boolean;
  showingGame: boolean;
  showingResult: boolean;
  showingScoreboard: boolean;
  hideClaim: boolean;
  playing: boolean;
  winningBidder: string;
  winningBid: number;
  dealerId: number;
  gameType: string;
  turnCards: Card[] = [];
  totalTricks: number;
  gameResult: any;
  readyForNextHand: boolean;

  numPlayers = 0;
  userIndex = -1;
  currentZIndex = 5;

  @Input() tableId: number;
  @Input()
  set user(user: User) {
    this.users[0] = user;
    this._user = user;
  }

  @Output() onJoinTable = new EventEmitter<{ name: string, conn: SocketService }>();

  @ViewChildren(HandComponent) hands: HandComponent[];

  constructor(private socketService: SocketService, private ref: ChangeDetectorRef, private dialog: MatDialog) {
    this.zIndexes = new Array<number>(4);
    this.zIndexes.fill(this.currentZIndex);
    this.readyForNextHand = true;
  }

  ngOnInit() {
    this.selectingGame = false;
    this.hideClaim = true;
    this.socketService.initSocket(`/table${this.tableId}`);
    this.onJoinTable.emit({ name: 'Table', conn: this.socketService });
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

    this.socketService.onAction<Array<Card>>('dealHand')
      .subscribe((cards) => {
        this.totalTricks = cards.length;
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
        if (!this.bidding) {
        for (const i in this.users) {
          if (this.users[i] && this.users[i].id === userId) {
            this.zIndexes[i] = 10;
          }
        }
      }
    });

    this.socketService.onAction<any>('startBidding')
      .subscribe(async (info) => {
        this.trumpCard = info.trumpCard;
        this.dealerId = info.dealerId;
        this.turnCards = [];
        this.winningBidder = '';

        this.gameType = info.gameType;
        this.bidding = true;
        this.playing = false;
        this.showingResult = false;


        this.currentZIndex = 5;
        this.zIndexes.fill(this.currentZIndex);

        // make sure player's hand is visible
        this.zIndexes[0] = 20;

      });

    this.socketService.onAction<any>('biddingComplete')
      .subscribe((bidData) => {
        this.winningBidder = bidData.winner;
        this.winningBid = bidData.bid;
        if (this._user.name === bidData.winner) {
          this.bidding = false;
          this.selectingGame = true;
        }
      });

    this.socketService.onAction<any>('beginPlay')
      .subscribe(() => {
        this.bidding = false;
        this.showingGame = false;
        this.playing = true;
        this.hideClaim = !this.showClaimButton();
      });

    this.socketService.onAction<Card>('sendTurnCard')
      .subscribe((card) => {
        this.selectingGame = false;
        this.doingTurn = true;
        if (this.turnCards[0]) {
          this.turnCards[1] = card;
        } else {
          this.turnCards[0] = card;
        }
      });

    this.socketService.onAction<any>('insertCard')
      .subscribe(() => {
        this.doingTurn = false;
        this.selectingGame = false;
        this.discarding = true;
      });

    this.socketService.onAction<Card[]>('confirmDiscard')
      .subscribe(() => this.discarding = false);

    this.socketService.onAction<SkatGameSelection>('gameSelected')
      .subscribe((selection) => {
        this.doingTurn = false;
        this.selectingGame = false;
        this.bidding = false;
        this.selectedGame = selection;
        if (!this.discarding) {
          this.showingGame = true;
        }

      });

      this.socketService.onAction<any>('skatGameResult')
        .subscribe((result) => {
          this.gameResult = result;
          this.readyForNextHand = false;
          this.showingResult = true;
          this.hideClaim = true;
        });

      this.socketService.onAction<number>('requestClaimAcceptance')
        .subscribe((trickCount) => {
          const dialogRef = this.dialog.open(AcceptclaimdialogComponent);
          dialogRef.componentInstance.trickCount = trickCount;
          dialogRef.componentInstance.socketService = this.socketService;
        });
  }
  sendDiscards() {
    const handComponent = this.hands.find((h) => h.location === 'bottom');
    if (handComponent.selectedCards.length === 2) {
      this.socketService.sendAction('discardSkat', handComponent.selectedCards.map((c) => c.card));
    }
  }

  onGameResultOk() {
    this.socketService.sendAction('readyForNextHand', null);
  }

  onScoreboardClick() {
    this.showingScoreboard = !this.showingScoreboard;
  }

  onClaimClick() {
    const dialogRef = this.dialog.open(ClaimdialogComponent);
    dialogRef.componentInstance.socketService = this.socketService;
  }

  showClaimButton(): boolean {
    return this._user.name && (this.winningBidder === this._user.name);
  }

}
