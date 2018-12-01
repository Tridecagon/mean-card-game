import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UiCard } from 'app/shared/model/uiCard';
import { Card, User } from 'app/../../../shared/model';
import { trigger, style, state, transition, animate } from '@angular/animations';
import { SocketService } from 'app/shared/services/socket.service';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'mcg-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.css'],
  animations: [
    trigger('dealCard', [
      transition(
        ':enter', [
          style({top: '35%', left: '42%'}),
          animate(300, style({top: '*', left: '*'}))
        ])
    ]),
    trigger('playCard', [
        transition(
          ':enter', [
         style({ top: '70%', left: '{{leftStart}}%'}),
         animate(300,  style({top: '*', left: '*'}))
          ]),
        transition(
          ':leave', [
            style({top: '*', left: '*'}),
            animate(500, style({ top: '40%', left: '40%'})),
            animate(500, style({ top: '100%', left: '40%'}))
          ])
    ]),
    trigger('flipCard', [
      state('down', style({transform: 'rotateY(180deg)'})),
      transition( 'up <=> down', animate(300))
    ])
  ]
})
export class HandComponent implements OnInit {

  activeHand: boolean;
  selectedCards: number[] = [];
  maxSelectedCards = 1;
  hand: UiCard[] = [];
  playedCard: UiCard;
  tricksTaken: number;
  bid: number;

  @Input() player: User;
  @Input() zIndex: number;
  @Input() location: string;


  constructor(private socketService: SocketService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.setupListeners();
  }

  computeLeft(card, i): number {
    card.leftPos = (i * 3.3) + ((26 - this.hand.length) * 1.65) + .1;
    return card.leftPos;
  }

  onClick(clickedCard: UiCard, index: number) {
    if (clickedCard.isSelected) {
      console.log(`Attempting to play ${clickedCard.card}`);
      this.socketService.sendAction('playRequest', clickedCard.card);
    } else {
      this.selectCard(clickedCard, index);
    }
  }

  selectCard(card: UiCard, index: number) {
    if (!card.isSelected) {
      card.toggleSelection();
      if (this.selectedCards.length === this.maxSelectedCards) {
        const deselectCard = this.selectedCards.shift();
        this.hand[deselectCard].toggleSelection();
      }
      this.selectedCards.push(index);
    }
  }

  private setupListeners(): void {
    this.socketService.initSocket();
    if (this.location === 'bottom' ) {
      this.socketService.onAction<Array<Card>>('dealHand')
        .subscribe((newHand) => {
          // console.log(newHand);
          this.hand = [];
          this.selectedCards = [];
          for (const card of newHand)
          {
            this.hand.push(new UiCard(card));
          }
        });

      this.socketService.onAction<any>('insertCard')
        .subscribe((cardInfo) => {
            const newCard = new UiCard(cardInfo.card);
            newCard.toggleSelection();
            this.hand.splice(cardInfo.index, 0, newCard);
        });
    }

      this.socketService.onAction<any>('tableDealCards')
      .subscribe((cards) => {
        // console.log(newHand);
        if (this.player && cards.toUser === this.player.id && this.location !== 'bottom') {
          for (let i = 0; i < cards.numCards; i++) {
            this.hand.push(new UiCard());
          }
        }
      });

      this.socketService.onAction<any>('playResponse')
      .subscribe((playInfo) => {
        if (this.player && playInfo.userId === this.player.id) {
          console.log(playInfo.card);
          this.play(playInfo.card);
        }
        this.activeHand = this.player && (playInfo.activePlayer === this.player.id);
      });

      this.socketService.onAction<any>('trickWon')
      .subscribe((userId) => {
        delete this.playedCard;
        this.activeHand = this.player && (userId === this.player.id);
        if (this.activeHand) {
          this.tricksTaken++;
        }
      });

      this.socketService.onAction<any>('beginPlay')
      .subscribe((activePlayerId) => {
        this.activeHand = this.player && (activePlayerId === this.player.id);
      });

      this.socketService.onAction<any>('bidResponse')
      .subscribe((bidData) => {
        if (bidData.userId === this.player.id) {
          this.bid = bidData.bidInfo.bid;
          this.tricksTaken = 0;
        }
      });
  }

  private play(card: Card) {
      if (this.location === 'bottom') { // TODO: change this condition to if hand cards are visible
      const i = this.hand.findIndex(c => c.card.suit === card.suit && c.card.description === card.description);
      if (i < 0) {
        console.log('Unable to find card ' + card);
        return;
      }
      if (this.hand[i].isSelected) {
        // remove it
        this.selectedCards.splice(this.selectedCards.findIndex(v => v === i));
      }
      this.hand.splice(i, 1);
      this.playedCard = new UiCard(card, 'up');
      this.computeLeft(this.playedCard, i);
    } else {
      this.playedCard = new UiCard(card);
      this.computeLeft(this.playedCard, this.hand.length / 2);
      if  (this.playedCard.face === 'down') {
        this.playedCard.flip();
      }
      this.hand.pop();
    }
  }

  private getHandTransform(): SafeStyle {

    let retVal = '';
    switch (this.location) {
      case 'top':
        retVal = 'rotateZ(180deg)';
        break;
      case 'left':
        retVal = 'translateX(-21.45%) rotateZ(90deg)';
        break;
      case 'right':
        retVal = 'translateX(21.45%) rotateZ(270deg)';
        break;
      /*
      case 'bottom':
        retVal = 'rotateZ(0deg)';
        break;
        */
    }
    return this.sanitizer.bypassSecurityTrustStyle(retVal);
  }

  private getNameplateTransform(): SafeStyle {

    let retVal = '';
    switch (this.location) {
      case 'top':
        retVal = 'rotateZ(180deg)';
        break;
    }
    return this.sanitizer.bypassSecurityTrustStyle(retVal);
  }
}
