import { Component, OnInit, Input } from '@angular/core';

import { Action } from '../shared/model/action';
import { Event } from '../shared/model/event';
import { Message } from '../shared/model/message';
import { User } from '../shared/model/user';
import { SocketService } from '../shared/services/socket.service';



@Component({
  selector: 'tcc-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  inputs: ['user']
})
export class ChatComponent implements OnInit {

  @Input() user: User;
  action = Action;
  messages: Message[] = [];
  messageContent: string;


  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.setupListeners();
  }



  public sendMessage(message: string): void {
    if (!message) {
      return;
    }

    this.socketService.send({
      from: this.user,
      content: message
    });
    this.messageContent = null;
  }

  private setupListeners(): void {
    this.socketService.initSocket();
    this.socketService.onMessage('chatMessage')
    .subscribe((message: Message) => {
      this.messages.push(message);
      Element
    });
  }
}
