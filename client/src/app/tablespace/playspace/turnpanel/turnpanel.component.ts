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
    }
  }
  @Input() set secondCard(card: Card) {
    if (card) {
      this.firstUiCard = new UiCard(card);
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
