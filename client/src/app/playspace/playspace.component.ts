import { Component, OnInit } from '@angular/core';
import { Card } from '../shared/model/card';

import { Message } from '../shared/model/message';
import { SocketService } from 'app/shared/services/socket.service';


@Component({
  selector: 'tcc-playspace',
  templateUrl: './playspace.component.html',
  styleUrls: ['./playspace.component.css']
})
export class PlayspaceComponent implements OnInit {

  hand: Card[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit() {
  
  }

  onDealClick() {
    /*this.hand.push(
      {
        suit: "Spades",
        description: "Ace"
      });
      */

      this.socketService.onAction<Array<Card>>('dealResponse')
      .subscribe((newHand) => {
        console.log(newHand);
        //this.hand = [];
        for(let card of newHand)
        {
          this.hand.push(card);
        }
      });

      this.socketService.sendAction('dealRequest', '');
  }

  

}
