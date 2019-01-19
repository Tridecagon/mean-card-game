import { Component } from '@angular/core';
import { ShowgamepanelComponent } from '../showgamepanel.component';

@Component({
  selector: 'mcg-showgamecompact',
  templateUrl: './showgamecompact.component.html',
  styleUrls: ['./showgamecompact.component.css']
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
