import { Component, Input, OnInit } from '@angular/core';
import { Channel } from 'app/shared/model/channel';
import { SocketService } from 'app/shared/services/socket.service';

@Component({
  selector: 'mcg-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css'],
  providers: [SocketService]
})
export class ChannelComponent implements OnInit {

  @Input() channel: Channel;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

}