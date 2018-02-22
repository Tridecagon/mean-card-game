import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material/material.module';

import { ChatComponent } from './chat.component';
 import { SocketService } from '../shared/services/socket.service';
import { ChannelComponent } from './channel/channel.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    ChatComponent
  ],
  declarations: [ChatComponent, ChannelComponent],
  providers: [SocketService]
})
export class ChatModule { }
