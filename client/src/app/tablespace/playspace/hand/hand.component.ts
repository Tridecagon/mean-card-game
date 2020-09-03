import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
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

    trigger('playCard', [
      transition(
        ':enter', [
          style({ top: '70%', left: '{{leftStart}}%' }),
          animate(300, style({ top: '*', left: '*' }))
        ]),
      transition(
        ':leave', [
          style({ top: '*', left: '*' }),
          animate(500, style({ top: '40%', left: '40%' })),
          animate(500, style({ top: '100%', left: '40%' }))
        ])
    ]),
    trigger('flipCard', [
      state('down', style({ transform: 'rotateY(180deg)' })),
      transition('up <=> down', animate(300))
    ])
  ]
})
export class HandComponent implements OnInit, OnChanges {

  activeHand: boolean;
  selectedCards: UiCard[] = [];
  maxSelectedCards = 0;
  hand: UiCard[] = [];
  playedCard: UiCard;
  tricksTaken: number;
  bid: number;
  playing: boolean;
  hold: boolean;
  cardrowHeight: number;

  @Input() player: User;
  @Input() zIndex: number;
  @Input() location: string;
  @ViewChild('crWrapper', {static: true}) cardrowView: ElementRef;


  constructor(private socketService: SocketService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.setupListeners();
  }

  ngOnChanges() {
    this.cardrowHeight = this.cardrowView ? this.cardrowView.nativeElement.offsetHeight : 100;
  }

  onClick(data: {card: UiCard, index: number}) {
    console.log('Hand click handler');
    if (this.playing) {
      if (data.card.isSelected) {
        console.log('Attempting to play', data.card.card);
        this.socketService.sendAction('playRequest', data.card.card);
      } else {
        this.selectCard(data.card);
      }
    } else if (this.maxSelectedCards > 0) {
      this.toggleSelectCard(data.card);
    }
  }

  selectCard(card: UiCard) {
    if (!card.isSelected) {
      card.toggleSelection();
      if (this.selectedCards.length === this.maxSelectedCards) {
        const deselectCard = this.selectedCards.shift();
        deselectCard.toggleSelection();
      }
      this.selectedCards.push(card);
    }
  }

  deselectCard(card: UiCard) {
    if (card.isSelected) {
      card.toggleSelection();
      this.selectedCards.splice(this.selectedCards.findIndex((c) => c === card), 1);
    }
  }

  toggleSelectCard(card: UiCard) {
    if (card.isSelected) {
      this.deselectCard(card);
    } else {
      this.selectCard(card);
    }
  }
  getColor(): string {
    return (this.activeHand && this.playing) ? 'yellow' : 'lightblue';
  }

  private setupListeners(): void {
    this.socketService.initSocket();
    if (this.location === 'bottom') {
      this.socketService.onAction<Array<Card>>('dealHand')
        .subscribe((newHand) => {
          this.cardrowHeight = this.cardrowView.nativeElement.offsetHeight;
          // console.log(newHand);
          this.hand = [];
          this.selectedCards = [];
          for (const card of newHand) {
            this.hand.push(new UiCard(card));
          }
        });

      this.socketService.onAction<any>('insertCard')
        .subscribe((cardInfo) => {
          this.maxSelectedCards = 2; // TODO: put this somewhere more appropriate
          const newCard = new UiCard(cardInfo.card);
          this.hand.splice(cardInfo.index, 0, newCard);
          this.selectCard(newCard);
        });
    }

    this.socketService.onAction<any>('tableDealCards')
      .subscribe((cards) => {
        // console.log(newHand);
        if (this.player && cards.toUser === this.player.id && this.location !== 'bottom') {
          this.cardrowHeight = this.cardrowView.nativeElement.offsetHeight;
          for (let i = 0; i < cards.numCards; i++) {
            this.hand.push(new UiCard());
          }
        }
      });

      this.socketService.onAction<any>('showHand')
      .subscribe((msg) => {  // cards, user
        this.cardrowHeight = this.cardrowView.nativeElement.offsetHeight;
        if (this.player && msg.user === this.player.id && this.location !== 'bottom') {
          this.hand = [];
          this.selectedCards = [];
          for (const card of msg.cards) {
            this.hand.push(new UiCard(card));
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
        this.playing = true;
        this.activeHand = this.player && (activePlayerId === this.player.id);
        if (this.location === 'bottom') {
          this.maxSelectedCards = 1;
        }
      });

    this.socketService.onAction<any>('startBidding')
      .subscribe((bidInfo) => {
        this.playing = false;
        this.hold = bidInfo.gameType === 'Skat' && this.player.id === bidInfo.holdId;
      }
      );

    this.socketService.onAction<any>('bidResponse')
      .subscribe((bidData) => {
        if (bidData.userId === this.player.id) {
          this.bid = bidData.bidInfo.bid;
          this.tricksTaken = 0;
        }
      });

    this.socketService.onAction<Card[]>('confirmDiscard')
      .subscribe((cards) => {
        for (const discard of cards) {
          this.hand.splice(this.hand.findIndex((uic) => Card.matches(uic.card, discard)), 1);
        }
        this.selectedCards = [];
        this.maxSelectedCards = 1;
      });

    this.socketService.onAction('resortHand')
      .subscribe((data: any) => {
        for (let i = 0; i < this.hand.length; i++) {
          if (!Card.matches(this.hand[i].card, data.order[i])) {
            const index = this.hand.findIndex((uc) => Card.matches(uc.card, data.order[i]));
            [this.hand[i].card, this.hand[index].card] = [this.hand[index].card, this.hand[i].card]; // swap
          }
        }
      });

    this.socketService.onAction('skatGameResult')
    .subscribe(() => {
      this.hand = [];
      this.playedCard = undefined;
    });
  }

  private play(card: Card) {
    if (this.hand[0].face === 'up') { // cards are visible, pick the right one
      const i = this.hand.findIndex(c => Card.matches(c.card, card));
      if (i < 0) {
        console.log('Unable to find card ' + card);
        return;
      }
      if (this.hand[i].isSelected) {
        // remove it
        this.selectedCards.splice(this.selectedCards.findIndex(c => c === this.hand[i]), 1);
      }
      this.hand.splice(i, 1);
      this.playedCard = new UiCard(card, 'up');
      this.computeLeft(this.playedCard, i);
    } else {
      this.playedCard = new UiCard(card);
      this.computeLeft(this.playedCard, this.hand.length / 2);
      if (this.playedCard.face === 'down') {
        this.playedCard.flip();
      }
      this.hand.pop();
    }
  }

  computeLeft(card, i): number {
    card.leftPos = (i * 3.3) + ((26 - this.hand.length) * 1.65) + .1;
    return card.leftPos;
  }

  getHandTransform(): SafeStyle {

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

  getNameplateTransform(): SafeStyle {

    let retVal = '';
    switch (this.location) {
      case 'top':
        retVal = 'rotateZ(180deg)';
        break;
    }
    return this.sanitizer.bypassSecurityTrustStyle(retVal);
  }
}
