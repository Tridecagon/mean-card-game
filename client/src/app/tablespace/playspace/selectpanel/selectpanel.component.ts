import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mcg-selectpanel',
  templateUrl: './selectpanel.component.html',
  styleUrls: ['./selectpanel.component.css']
})
export class SelectpanelComponent implements OnInit {

  @Input() gameType: string;
  constructor() { }

  ngOnInit() {
  }

  selectGame(choice: string) {
    const selectedGame = choice;
  }

}
