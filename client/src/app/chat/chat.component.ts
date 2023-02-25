import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { Action, User } from '../../../../shared/model';
import {  ChannelCollection } from '../shared/model';



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
  defaultSize = 40;
  collapsedSize = 20;
  collapsed = false;
  collapsedIcon = 'keyboard_arrow_up';
  defaultIcon = 'keyboard_arrow_down';
  currentSize = '40%';
  currentIcon = 'keyboard_arrow_down';


  @Output() onResize = new EventEmitter<{size: number}>();

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
    this.channelList.selectedChannel.sendMessage(this.user, this.messageContent, 
      this.channelList.selectedChannel.channelName);
    this.messageContent = '';
  }

  toggleSize() {
    this.collapsed = !this.collapsed;
    this.currentIcon = this.collapsed ? this.collapsedIcon : this.defaultIcon;
    const size = this.collapsed ? this.collapsedSize : this.defaultSize;
    this.currentSize = `${size}%`;
    this.onResize.emit({size});
  }

}
