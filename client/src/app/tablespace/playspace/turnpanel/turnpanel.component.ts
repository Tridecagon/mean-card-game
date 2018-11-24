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
  _firstCard: Card;
  _secondCard: Card;
  firstUiCard: UiCard;
  secondUiCard: UiCard;
  selectedTurn = '';

  @Input() set firstCard(card: Card) {
    this._firstCard = card;
    this.firstUiCard.card = card;
    setTimeout(() => this.firstUiCard.flip(), 0);
    // this.firstUiCard.flip();
  }
  @Input() set secondCard(card: Card) {
    this._secondCard = card;
    this.secondUiCard.card = card;
    setTimeout(() => this.secondUiCard.flip(), 0);
    // this.secondUiCard.flip();
  }

  constructor(private socketService: SocketService) {
    this.firstUiCard = new UiCard();
    this.secondUiCard = new UiCard();
   }

  ngOnInit() {
    this.selectedTurn = '';
  }

  getCardFace(index: number): string {
    const card = index === 0 ? this.firstUiCard : this.secondUiCard;
    return card ? card.getFullImageString() : '';
  }

  currentTurnCardIsJack(): boolean {
    if (this._secondCard) {
      return this._secondCard.description === 'Jack';
    } else if (this._firstCard) {
      return this._firstCard.description === 'Jack';
    } else {
      return false;
    }
  }

  selectTrump() {
    this.selectedTurn = this._secondCard ? this._secondCard.suit : this._firstCard.suit;
  }

  selectJacks() {
    this.selectedTurn = 'Jacks';
  }

  selectDoubleTurn() {
    this.selectedTurn = 'DoubleTurn';
  }

  private candidateSuit(): string {
    return this._secondCard ? this._secondCard.suit : this._firstCard.suit;
  }

  private confirmChoice() {
    this.socketService.sendAction('chooseTurn', this.selectedTurn);
  }

  private getColor(button: string): string {
    if (button === 'Suit') {
      return ( ['Club', 'Spade', 'Heart', 'Diamond'].includes(this.selectedTurn)) ? 'accent' : 'primary';
    } else {
      return (this.selectedTurn === button) ? 'accent' : 'primary';
    }
  }

}
