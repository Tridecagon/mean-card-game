import { Component, OnInit } from '@angular/core';
import { Card } from './shared/model/card';


@Component({
  selector: 'tcc-playspace',
  templateUrl: './playspace.component.html',
  styleUrls: ['./playspace.component.css']
})
export class PlayspaceComponent implements OnInit {

  hand: Card[] = [];

  constructor() { }

  ngOnInit() {
  }

  onDealClick() {
    this.hand.push(
      {
        suit: "Spades",
        rank: "Ace"
      });
  }

}
