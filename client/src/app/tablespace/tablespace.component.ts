import { Component, OnInit, Input } from '@angular/core';
import { trigger, style, state, transition, animate } from '@angular/animations';
import { Card } from '../../../../shared/model/card';
import { User } from '../shared/model/user';

import { Message } from '../shared/model/message';
import { SocketService } from 'app/shared/services/socket.service';


@Component({
  selector: 'tcc-tablespace',
  templateUrl: './tablespace.component.html',
  styleUrls: ['./tablespace.component.css'],
  animations: [
    trigger('playCard', [
        // state('void', style({left: '-50%'})),
        // state('inHand', style({left: '*'})),
        state('played', style({ top: '-120%', left: '20%'})),
        // transition(':enter',  animate(300)),
        transition(
          '* => played', animate(200)),
        transition(
          ':enter', [
            style({top: '-150%', left: '20%'}),
            animate(300, style({top: '0%', left: '20%'})),
            animate(300, style({top: '*', left: '*'}))
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

export class TablespaceComponent implements OnInit {

  @Input() user: User;
  hand: Card[] = [];
  selectedCards: number[] = [];
  maxSelectedCards = 1;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.setupListeners();
  }

  onDealClick() {
      this.socketService.sendAction('dealRequest', '');
  }

  onClick(card: Card, index: number) {
    if (card.isSelected) {
      console.log('Attempting to play ${card}');
      this.socketService.sendAction('playRequest', card);
    } else {
      this.selectCard(card, index);
    }
  }

  selectCard(card: Card, index: number) {
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
    this.socketService.onAction<Array<Card>>('dealResponse')
      .subscribe((newHand) => {
        console.log(newHand);
        this.hand = [];
        this.selectedCards = [];
        for (const card of newHand)
        {
          this.hand.push(new Card(card.suit, card.description, card.sort));
        }
      });

      this.socketService.onAction<Card>('playResponse')
      .subscribe((playedCard) => {
        console.log(playedCard);
        this.play(playedCard);
      });
  }

  private play(card: Card) {
    const i = this.hand.findIndex(c => c.suit === card.suit && c.description === card.description);
    if (this.hand[i].isSelected) {
      // remove it
      this.selectedCards.splice(this.selectedCards.findIndex(v => v === i));
    }
    this.hand[i].play();
  }
}
