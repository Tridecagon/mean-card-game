import { Component, OnInit, Input } from '@angular/core';
import { SkatGameSelection, SkatGameType } from '../../../../../../shared/model';

@Component({
  selector: 'mcg-selectpanel',
  templateUrl: './selectpanel.component.html',
  styleUrls: ['./selectpanel.component.css']
})
export class SelectpanelComponent implements OnInit {

  myGame: SkatGameSelection;
  @Input() gameType: string;
  constructor() { }

  ngOnInit() {
    this.myGame.selection = undefined;
    this.myGame.declarations.schneider = this.myGame.declarations.schwarz = false;
  }

  selectGame(choice: string) {
    this.myGame.selection = SkatGameType[choice];
    if (!this.canDeclare()) {
      this.myGame.declarations.schneider = this.myGame.declarations.schwarz = false;
    }
    if (choice === 'Grand Overt') {
      this.myGame.declarations.schneider = this.myGame.declarations.schwarz = true;
    }
  }

  getColor(buttonName: string): string {
    return buttonName === this.myGame.selection.toString() ? 'accent' : 'primary';
  }

  canDeclare(): boolean {
    return ['Clubs', 'Spades', 'Hearts', 'Diamonds', 'Grand', '']
    .some(t => t === SkatGameType[this.myGame.selection]);
  }

}
