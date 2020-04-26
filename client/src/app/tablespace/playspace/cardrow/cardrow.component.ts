import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UiCard } from 'app/shared/model';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'mcg-cardrow',
  templateUrl: './cardrow.component.html',
  styleUrls: ['./cardrow.component.css'],
  animations: [
    trigger('dealCard', [
      transition(
        ':enter', [
          style({ top: '35%', left: '42%' }),
          animate(300, style({ top: '*', left: '*' }))
        ])
    ]),
    trigger('flipCard', [
      state('down', style({ transform: 'rotateY(180deg)' })),
      transition('up <=> down', animate(300))
    ])
  ]
})
export class CardrowComponent implements OnInit {

  @Input() cards: UiCard[];
  @Input() height: 100;
  @Input() offset = 0;
  @Output() onClick = new EventEmitter<{card: UiCard, index: number}>();
  constructor() { }

  ngOnInit() {
  }

  computeLeft(card, i): number {
    card.leftPos = (i * 3.3) + ((26 - this.cards.length) * 1.65) + .1;
    return card.leftPos;
  }

  clicked(card: UiCard, index: number) {
    console.log('Cardrow click handler');
    this.onClick.emit({card, index});
  }
}
