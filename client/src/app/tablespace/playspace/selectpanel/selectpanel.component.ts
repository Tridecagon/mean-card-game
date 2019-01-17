import { TurnpanelComponent } from './../turnpanel/turnpanel.component';
import { Component, OnInit, Input } from '@angular/core';
import { SkatGameSelection, SkatGameType } from '../../../../../../shared/model/skat';
import { SocketService } from 'app/shared/services/socket.service';
import { Suit } from '../../../../../../shared/model';

@Component({
  selector: 'mcg-selectpanel',
  templateUrl: './selectpanel.component.html',
  styleUrls: ['./selectpanel.component.css']
})
export class SelectpanelComponent implements OnInit {

  myGame: SkatGameSelection;
  @Input() gameType: string;
  @Input() winningBid: number;
  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.myGame = {
      selection: SkatGameType.None,
      declarations: {
        schneider: false,
        schwarz: false
      }
    };
  }
  canRamsch(): boolean {
    return this.winningBid === 5;
  }

  selectSkatGame(choice: string) {
    switch (choice) {
      case 'Club':
      case 'Spade':
      case 'Heart':
      case 'Diamond':
        this.myGame.selection = SkatGameType.Solo;
        this.myGame.suit = Suit[choice];
        break;
      case 'Grand':
      case 'GrandOvert':
      case 'Guetz':
      case 'Ramsch':
        this.myGame.selection = SkatGameType[choice];
        this.myGame.suit = Suit.Jack;
        break;
      case 'Null':
      case 'NullOvert':
        this.myGame.selection = SkatGameType[choice];
        this.myGame.suit = Suit.Null;
        break;
      default: // turn
        this.myGame.selection = SkatGameType[choice];
        this.myGame.suit = undefined;
        break;
    }
    if (!this.canDeclare()) {
      this.myGame.declarations.schneider = this.myGame.declarations.schwarz = false;
    }
    if (this.myGame.selection === SkatGameType.GrandOvert) {
      this.myGame.declarations.schneider = this.myGame.declarations.schwarz = true;
    }
  }

  confirmSelection() {
    this.socketService.sendAction('selectSkatGame', this.myGame);
  }

  canConfirm(): boolean {
    return this.myGame && this.myGame.selection !== SkatGameType.None;
  }

  getColor(buttonName: string): string {
    return (this.myGame &&
              (buttonName === SkatGameType[this.myGame.selection]
              || (this.myGame.selection === SkatGameType.Solo && Suit[buttonName] === this.myGame.suit) ))
               ? 'accent' : 'primary';
  }

  canDeclare(): boolean {
    return ['Solo', 'Grand', 'None']
    .some(t => t === SkatGameType[this.myGame.selection]);
  }

  getSchneider() {
    return this.myGame.declarations.schneider;
  }

  setSchneider() {
    this.myGame.declarations.schneider = !this.myGame.declarations.schneider;
    if (!this.myGame.declarations.schneider) {
      this.myGame.declarations.schwarz = false;
    }
  }

  getSchwarz() {
    return this.myGame.declarations.schwarz;
  }
  setSchwarz() {
    this.myGame.declarations.schwarz = !this.myGame.declarations.schwarz;
    if (this.myGame.declarations.schwarz) {
      this.myGame.declarations.schneider = true;
    }
  }

}
