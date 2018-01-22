import { Component, OnInit } from '@angular/core';

import { ChatModule } from '../chat/chat.module';
import { ChatComponent } from '../chat/chat.component';
import { SharedModule } from '../shared/shared.module';
import { PlayspaceModule } from '../playspace/playspace.module';
import { PlayspaceComponent } from '../playspace/playspace.component';

@Component({
  selector: 'tcc-mainpanel',
  templateUrl: './mainpanel.component.html',
  styleUrls: ['./mainpanel.component.css']
})
export class MainpanelComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
