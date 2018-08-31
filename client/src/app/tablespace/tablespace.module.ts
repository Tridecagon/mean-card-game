import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material/material.module';

import { TablespaceComponent } from './tablespace.component';
import { SocketService } from '../shared/services/socket.service';
import { DialogUserComponent } from '../dialog-user/dialog-user.component';
import { HandComponent } from './playspace/hand/hand.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PlayspaceComponent } from './playspace/playspace.component';
import { BidpanelComponent } from './playspace/bidpanel/bidpanel.component';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';

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
  declarations: [TablespaceComponent, HandComponent, LobbyComponent, PlayspaceComponent, BidpanelComponent],
  providers: [
    SocketService,
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ]
})
export class TablespaceModule { }
