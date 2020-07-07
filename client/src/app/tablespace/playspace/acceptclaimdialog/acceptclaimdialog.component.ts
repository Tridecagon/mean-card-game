import { Component, OnInit } from '@angular/core';
import { SocketService } from 'app/shared/services/socket.service';

@Component({
  selector: 'mcg-acceptclaimdialog',
  templateUrl: './acceptclaimdialog.component.html',
  styleUrls: ['./acceptclaimdialog.component.css']
})
export class AcceptclaimdialogComponent implements OnInit {

  trickCount: number;
  socketService: SocketService;

  constructor() { }

  ngOnInit() {
  }

  onAcceptClaim() {
    this.socketService.sendAction('acceptClaim', {});
  }

  onRejectClaim() {
    this.socketService.sendAction('rejectClaim', {});
  }

}
