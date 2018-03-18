import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../shared/material/material.module';
import { MatTableModule } from '@angular/material/table';

import { TablespaceComponent } from './tablespace.component';
import { SocketService } from '../shared/services/socket.service';
import { DialogUserComponent } from '../dialog-user/dialog-user.component';
import { HandComponent } from './playspace/hand/hand.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PlayspaceComponent } from './playspace/playspace.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    MatTableModule
  ],
  exports: [
    TablespaceComponent
  ],
  declarations: [TablespaceComponent, HandComponent, LobbyComponent, PlayspaceComponent],
  providers: [SocketService]
})
export class TablespaceModule { }
