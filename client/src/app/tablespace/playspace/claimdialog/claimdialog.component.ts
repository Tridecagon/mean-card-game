import { SocketService } from './../../../shared/services/socket.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mcg-claimdialog',
  templateUrl: './claimdialog.component.html',
  styleUrls: ['./claimdialog.component.css']
})
export class ClaimdialogComponent implements OnInit {

  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

  onClaim() {
    this.socketService.sendAction('requestClaim', {});
  }

}
