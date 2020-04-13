import { Component } from '@angular/core';
import { ShowgamepanelComponent } from '../showgamepanel.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'mcg-showgamecompact',
  templateUrl: './showgamecompact.component.html',
  styleUrls: ['./showgamecompact.component.css'],
  animations: [
    trigger('flipCard', [
      state('down', style({ transform: 'rotateY(180deg)' })),
      transition('up <=> down', animate(300))
    ])
  ]
})
export class ShowgamecompactComponent extends ShowgamepanelComponent {

  declarations() {
    let retval = '';
    if (this._selectedGame.declarations && this._selectedGame.declarations.schneider) {
      retval = 'Schneider - ';
      if (this._selectedGame.declarations.schwarz) {
        retval += 'Schwarz - ';
      }
    }
    return retval;
  }
}
