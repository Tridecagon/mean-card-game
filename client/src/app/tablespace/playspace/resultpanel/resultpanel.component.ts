import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Card } from '../../../../../../shared/model';
import { UiCard } from 'app/shared/model';

@Component({
  selector: 'mcg-resultpanel',
  templateUrl: './resultpanel.component.html',
  styleUrls: ['./resultpanel.component.css']
})
export class ResultpanelComponent implements OnInit, OnChanges {

  @Input() result: {cards: Card[], score: number, cardPoints: number};
  @Output() onOk = new EventEmitter();

  uiCards: UiCard[];

  constructor() {
    this.uiCards = [];
  }

  ngOnInit() {
  }

  ngOnChanges() {

    if (this.result) {
      console.log('Showing game result', this.result);
      this.uiCards = [];
      for (const card of this.result.cards || []) {
        this.uiCards.push(new UiCard(card, 'down'));
        // why is this backwards?
      }
    } else {
      console.log('Game result not populated');
    }

  }

  clickHandler() {

    this.onOk.emit();
  }

}
