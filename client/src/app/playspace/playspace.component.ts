import { Component, OnInit, Input } from '@angular/core';
import { Card } from '../shared/model/card';
import { User } from '../shared/model/user';

import { Message } from '../shared/model/message';
import { SocketService } from 'app/shared/services/socket.service';


@Component({
  selector: 'tcc-playspace',
  templateUrl: './playspace.component.html',
  styleUrls: ['./playspace.component.css']
})

export class PlayspaceComponent implements OnInit {

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
    card.toggleSelection();
    if (this.selectedCards.length === this.maxSelectedCards) {
      const deselectCard = this.selectedCards.shift();
      this.hand[deselectCard].toggleSelection();
    }
    this.selectedCards.push(index);
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
  }
}
