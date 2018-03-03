import { Component, OnInit, Input } from '@angular/core';

import { Action, Message, User } from '../../../../shared/model';
import { Event } from '../shared/model/event';
import { SocketService } from '../shared/services/socket.service';



@Component({
  selector: 'mcg-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  @Input() user: User;
  action = Action;
  messages: Message[] = [];
  messageContent: string;
  channels: any[] = [];


  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.setupListeners();
    this.channels.push({'name': 'lobby'});
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
    });
  }

}
