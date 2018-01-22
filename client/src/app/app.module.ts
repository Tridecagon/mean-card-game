import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './chat/chat.module';
import { SharedModule } from './shared/shared.module';
import { PlayspaceModule } from './playspace/playspace.module';
import { MainpanelComponent } from './mainpanel/mainpanel.component';

@NgModule({
  declarations: [
    AppComponent,
    MainpanelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ChatModule,
    SharedModule,
    PlayspaceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
