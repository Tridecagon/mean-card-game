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
    trigger('playCard-bottom', [
        transition(
          ':enter', [
         style({ top: '70%', left: '{{leftStart}}%'}),
         animate(200,  style({top: '*', left: '*'}))
          ])
    ]),
    trigger('flipCard', [
      transition(
        'in => out', [
          style({width: '100%', left: '0'}),
          animate(300, style({width: '0', left: '50%'}))
        ]
      ),
      transition(
        'out => in', [
          style({width: '0', left: '50%'}),
          animate(300, style({width: '100%', left: '0'}))
        ]
      )
    ])
  ]
})
export class HandComponent implements OnInit {

  selectedCards: number[] = [];
  maxSelectedCards = 1;
  hand: UiCard[] = [];
  playedCard: UiCard;

  @Input() player: User;
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
      console.log('Attempting to play ${card}');
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

      this.socketService.onAction<Card>('playResponse')
      .subscribe((playedCard) => {
        console.log(playedCard);
        this.play(playedCard);
      });
  }

  private play(card: Card) {
    const i = this.hand.findIndex(c => c.card.suit === card.suit && c.card.description === card.description);
    if (i < 0) {
      console.log('Unable to find card ' + card);
      return;
    }
    if (this.hand[i].isSelected) {
      // remove it
      this.selectedCards.splice(this.selectedCards.findIndex(v => v === i));
    }
    this.hand[i].play();
    this.playedCard = this.hand.splice(i, 1)[0];
  }

  private getStyle(): SafeStyle {

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
    }
    return this.sanitizer.bypassSecurityTrustStyle(retVal);
  }
}
