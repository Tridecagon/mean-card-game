import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { PlayspaceComponent } from './playspace/playspace.component';
import { MainpanelComponent } from 'app/mainpanel/mainpanel.component';

const routes: Routes = [
  {
    path: '', component: MainpanelComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
