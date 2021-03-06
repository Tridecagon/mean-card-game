import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { Card } from '../../../../../../shared/model';
import { UiCard } from 'app/shared/model';

@Component({
  selector: 'mcg-resultpanel',
  templateUrl: './resultpanel.component.html',
  styleUrls: ['./resultpanel.component.css']
})
export class ResultpanelComponent implements AfterViewInit, OnChanges {

  @Input() result: {cards: Card[], score: number, cardPoints: number, winner?: string, skat?: Card[]};
  @Output() onOk = new EventEmitter();
  @ViewChild('crContainer', {static: true}) cardrowView: ElementRef;

  uiCards: UiCard[];
  uiSkatCards: UiCard[];
  cardrowHeight: number;

  constructor() {
    this.uiCards = [];
    this.uiSkatCards = [];
  }

  ngAfterViewInit() {
    this.cardrowHeight = this.cardrowView.nativeElement.offsetHeight;
  }

  ngOnChanges() {

    if (this.result) {
      console.log('Showing game result', this.result);
      this.uiCards = [];
      for (const card of this.result.cards || []) {
        this.uiCards.push(new UiCard(card, 'down'));
        // why is this backwards?
      }
      for (const card of this.result.skat || []) {
        this.uiSkatCards.push(new UiCard(card, 'down'));
      }
    } else {
      console.log('Game result not populated');
    }

  }

  clickHandler() {

    this.onOk.emit();
  }

}
