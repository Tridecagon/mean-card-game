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
    this.myGame.selection = SkatGameType[choice];
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
    return (this.myGame && (buttonName === SkatGameType[this.myGame.selection])) ? 'accent' : 'primary';
  }

  canDeclare(): boolean {
    return ['Clubs', 'Spades', 'Hearts', 'Diamonds', 'Grand', 'None']
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
