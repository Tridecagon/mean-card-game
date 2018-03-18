import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { Action, Message, User } from '../../../../shared/model';
import { Channel, ChannelCollection, Event } from '../shared/model';
import { SocketService } from '../shared/services/socket.service';



@Component({
  selector: 'mcg-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnChanges {

  @Input() user: User;
  @Input() channelList: ChannelCollection;
  action = Action;
  messageContent: string;


  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
  }

  selectChannel(channelName: string) {
    this.channelList.SelectChannel(channelName);
  }

  sendMessage() {
    if (!this.channelList.selectedChannel) {
      this.selectChannel('lobby');
    }
    this.channelList.selectedChannel.sendMessage(this.user, this.messageContent);
    this.messageContent = '';
  }

}
