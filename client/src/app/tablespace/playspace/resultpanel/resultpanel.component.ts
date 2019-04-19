import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Card } from '../../../../../../shared/model';
import { UiCard } from 'app/shared/model';

@Component({
  selector: 'mcg-resultpanel',
  templateUrl: './resultpanel.component.html',
  styleUrls: ['./resultpanel.component.css']
})
export class ResultpanelComponent implements OnInit {

  @Input() result: {cards: Card[], score: number};
  @Output() onOk = new EventEmitter();

  uiCards: UiCard[];

  constructor() { 
    this.uiCards = [];
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.result.cards.forEach(card => {
      this.uiCards.push(new UiCard(card, "up"));
    });
  }

  clickHandler() {

    this.onOk.emit();
  }

}
