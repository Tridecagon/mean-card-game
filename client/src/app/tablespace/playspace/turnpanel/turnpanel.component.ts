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

  constructor() { }

  ngOnInit() {
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

}
