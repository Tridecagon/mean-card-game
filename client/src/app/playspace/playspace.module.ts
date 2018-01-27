import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../shared/material/material.module';

import { PlayspaceComponent } from './playspace.component';
import { SocketService } from '../shared/services/socket.service';
import { DialogUserComponent } from '../dialog-user/dialog-user.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    PlayspaceComponent
  ],
  declarations: [PlayspaceComponent],
  providers: [SocketService]
})
export class PlayspaceModule { }
