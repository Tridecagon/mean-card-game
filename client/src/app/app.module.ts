import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './shared/material/material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './chat/chat.module';
import { SharedModule } from './shared/shared.module';
import { PlayspaceModule } from './playspace/playspace.module';
import { MainpanelComponent } from './mainpanel/mainpanel.component';

import { SocketService } from './shared/services/socket.service';
import { DialogUserComponent } from 'app/dialog-user/dialog-user.component';

@NgModule({
  declarations: [
    AppComponent,
    MainpanelComponent,
    DialogUserComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ChatModule,
    SharedModule,
    PlayspaceModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [SocketService],
  entryComponents: [DialogUserComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
