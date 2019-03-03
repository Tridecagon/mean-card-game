import { SkatGameSelection, SkatGameType } from './../../../../../../shared/model/skat';
import { Component, OnInit, Input } from '@angular/core';
import { Suit } from '../../../../../../shared/model';
import { UiCard } from 'app/shared/model';

@Component({
  selector: 'mcg-showgamepanel',
  templateUrl: './showgamepanel.component.html',
  styleUrls: ['./showgamepanel.component.css']
})

export class ShowgamepanelComponent implements OnInit {

  _selectedGame: SkatGameSelection;
  uiCard: UiCard;

  @Input() bidder: string;
  @Input() winningBid: number;

  @Input() set selectedGame(selection: SkatGameSelection) {
    this._selectedGame = selection;
    if (this._selectedGame.turnCard) {
      this.uiCard = new UiCard(this._selectedGame.turnCard);
      setTimeout(() => this.uiCard.flip(), 0);
    }
  }
  constructor() { }

  ngOnInit() {
  }

  gameString(): string {
    switch (this._selectedGame.selection) {
      case SkatGameType.Solo:
        return `${Suit[this._selectedGame.suit as number]} Solo`;
      case SkatGameType.Turn:
        const doubleString = this._selectedGame.doubleTurn ? 'Double ' : '';
        return  `${Suit[Suit[this._selectedGame.suit as number]]} ${doubleString}Turn`;
      case SkatGameType.NullOvert:
      case SkatGameType.GrandOvert:
        return `${SkatGameType[this._selectedGame.selection as number]}`.replace('Overt', ' Overt');
      default:
        return `${SkatGameType[this._selectedGame.selection as number]}`;
    }
  }
  getCardFace(): string {
    return this.uiCard ? this.uiCard.getFullImageString() : '';
  }
}
