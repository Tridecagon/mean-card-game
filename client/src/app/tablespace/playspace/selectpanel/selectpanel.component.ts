import { Component, OnInit, Input } from '@angular/core';
import { SkatGameSelection, SkatGameType } from '../../../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';

@Component({
  selector: 'mcg-selectpanel',
  templateUrl: './selectpanel.component.html',
  styleUrls: ['./selectpanel.component.css']
})
export class SelectpanelComponent implements OnInit {

  myGame: SkatGameSelection;
  canRamsch: boolean;
  @Input() gameType: string;
  @Input() winningBid: number;
  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.canRamsch = this.winningBid === 5;
    this.myGame = {
      selection: undefined,
      declarations: {
        schneider: false,
        schwarz: false
      }
    };
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

  confirmSelection() {
    this.socketService.sendAction('selectGame', this.myGame);
  }

  getColor(buttonName: string): string {
    return (buttonName === (this.myGame && this.myGame.selection && this.myGame.selection.toString())) ? 'accent' : 'primary';
  }

  canDeclare(): boolean {
    return ['Clubs', 'Spades', 'Hearts', 'Diamonds', 'Grand', '']
    .some(t => t === SkatGameType[this.myGame.selection]);
  }

  validateSchneider() {
    if (!this.myGame.declarations.schneider) {
      this.myGame.declarations.schwarz = false;
    }
  }

  validateSchwarz() {
    if (this.myGame.declarations.schwarz) {
      this.myGame.declarations.schneider = true;
    }
  }

}
