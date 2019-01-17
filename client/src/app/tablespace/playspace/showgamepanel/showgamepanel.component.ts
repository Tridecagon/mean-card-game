import { SkatGameSelection } from './../../../../../../shared/model/skat';
import { Component, OnInit, Input } from '@angular/core';
import { Card } from '../../../../../../shared/model';
import { UiCard } from 'app/shared/model';

@Component({
  selector: 'mcg-showgamepanel',
  templateUrl: './showgamepanel.component.html',
  styleUrls: ['./showgamepanel.component.css']
})
export class ShowgamepanelComponent implements OnInit {

  _selectedGame: SkatGameSelection;
  _trumpCard: Card;
  uiCard: UiCard;

  @Input() set selectedGame(selection: SkatGameSelection) {

  }
  constructor() { }

  ngOnInit() {
  }

}
