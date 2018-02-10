import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../shared/material/material.module';
import { MatTableModule } from '@angular/material/table';

import { TablespaceComponent } from './tablespace.component';
import { SocketService } from '../shared/services/socket.service';
import { DialogUserComponent } from '../dialog-user/dialog-user.component';
import { HandComponent } from './hand/hand.component';
import { LobbyComponent } from './lobby/lobby.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    MatTableModule
  ],
  exports: [
    TablespaceComponent
  ],
  declarations: [TablespaceComponent, HandComponent, LobbyComponent],
  providers: [SocketService]
})
export class TablespaceModule { }
