import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material/material.module';

import { TablespaceComponent } from './tablespace.component';
import { SocketService } from '../shared/services/socket.service';
import { HandComponent } from './playspace/hand/hand.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PlayspaceComponent } from './playspace/playspace.component';
import { BidpanelComponent } from './playspace/bidpanel/bidpanel.component';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { BidcardComponent } from './playspace/bidpanel/bidcard/bidcard.component';
import { SelectpanelComponent } from './playspace/selectpanel/selectpanel.component';
import { TurnpanelComponent } from './playspace/turnpanel/turnpanel.component';
import { DiscardpanelComponent } from './playspace/discardpanel/discardpanel.component';
import { ShowgamepanelComponent } from './playspace/showgamepanel/showgamepanel.component';
import { ShowgamecompactComponent } from './playspace/showgamepanel/showgamecompact/showgamecompact.component';
import { SelectsortcontrolComponent } from './playspace/selectsortcontrol/selectsortcontrol.component';
import { ResultpanelComponent } from './playspace/resultpanel/resultpanel.component';
import { CardrowComponent } from './playspace/cardrow/cardrow.component';
import { ScoreboardComponent } from './playspace/scoreboard/scoreboard.component';
import { ClaimdialogComponent } from './playspace/claimdialog/claimdialog.component';
import { AcceptclaimdialogComponent } from './playspace/acceptclaimdialog/acceptclaimdialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    TablespaceComponent
  ],
  declarations: [TablespaceComponent, HandComponent, LobbyComponent, PlayspaceComponent, BidpanelComponent,
    BidcardComponent, SelectpanelComponent, TurnpanelComponent, DiscardpanelComponent, ShowgamepanelComponent,
    ShowgamecompactComponent, SelectsortcontrolComponent, ResultpanelComponent, CardrowComponent,
    ScoreboardComponent, ClaimdialogComponent, AcceptclaimdialogComponent],
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ]
})
export class TablespaceModule { }
