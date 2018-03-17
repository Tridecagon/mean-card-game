import { Component, OnInit, Input } from '@angular/core';

import { Action, Message, User } from '../../../../shared/model';
import { Channel, Event } from '../shared/model';
import { SocketService } from '../shared/services/socket.service';



@Component({
  selector: 'mcg-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @Input() user: User;
  action = Action;
  messageContent: string;
  channels: Channel[] = [];
  selectedChannel: Channel;


  constructor() { }

  ngOnInit(): void {
    this.channels.push(new Channel('lobby'));
    this.selectChannel('lobby');
  }

  selectChannel(channelName: string) {
    if (this.selectedChannel) {
      this.selectedChannel.selected = false;
    }
    this.selectedChannel = this.channels.find(c => c.channelName === channelName);
    this.selectedChannel.selected = true;
  }

  sendMessage() {
    this.selectedChannel.sendMessage(this.user, this.messageContent);
    this.messageContent = '';
  }

}
