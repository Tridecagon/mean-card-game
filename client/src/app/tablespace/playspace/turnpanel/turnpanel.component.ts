import { SocketService } from 'app/shared/services/socket.service';
import { Component, OnInit, Input } from '@angular/core';
import { trigger, style, state, transition, animate } from '@angular/animations';
import { Card, User } from 'app/../../../shared/model';
import { UiCard } from 'app/shared/model';

@Component({
  selector: 'mcg-turnpanel',
  templateUrl: './turnpanel.component.html',
  styleUrls: ['./turnpanel.component.css'],
  animations: [
    trigger('flipCard', [
      state('down', style({transform: 'rotateY(180deg)'})),
      transition( 'up <=> down', animate(300))
    ])
  ]
})
export class TurnpanelComponent implements OnInit {
  firstUiCard: UiCard;
  secondUiCard: UiCard;
  selectedTurn = '';

  @Input() set firstCard(card: Card) {
    if (card) {
      this.firstUiCard = new UiCard(card);
      this.firstUiCard.flip();
    }
  }
  @Input() set secondCard(card: Card) {
    if (card) {
      this.secondUiCard = new UiCard(card);
      this.secondUiCard.flip();
    }
  }

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.selectedTurn = '';
  }

  getCardFace(index: number): string {
    const card = index === 0 ? this.firstUiCard : this.secondUiCard;
    return card ? card.getFullImageString() : UiCard.fullCardBackImage();
  }

  currentTurnCardIsJack(): boolean {
    if (this.secondUiCard) {
      return this.secondUiCard.card.description === 'Jack';
    } else if (this.firstCard) {
      return this.firstUiCard.card.description === 'Jack';
    } else {
      return false;
    }
  }

  selectTrump() {
    this.selectedTurn = this.secondCard ? this.secondCard.suit : this.firstCard.suit;
  }

  selectJacks() {
    this.selectedTurn = 'Jacks';
  }

  selectDoubleTurn() {
    this.selectedTurn = 'DoubleTurn';
  }

  private confirmChoice() {
    this.socketService.sendAction('chooseTurn', this.selectedTurn);
  }

  private getColor(button: string): string {
    if (button === 'Suit') {
      return (this.selectedTurn in ['Club', 'Spade', 'Heart', 'Diamond']) ? 'accent' : 'primary';
    } else {
      return (this.selectedTurn === button) ? 'accent' : 'primary';
    }
  }

}
