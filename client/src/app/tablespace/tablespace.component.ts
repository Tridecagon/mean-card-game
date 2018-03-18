import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Card, Message, User } from '../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';


@Component({
  selector: 'mcg-tablespace',
  templateUrl: './tablespace.component.html',
  styleUrls: ['./tablespace.component.css']
})

export class TablespaceComponent implements OnInit {

  inGame = false;
  tableId: number;
  @Input() user: User;

  @Output() onJoinTable = new EventEmitter<{name: string, conn: SocketService}>();

  constructor(private socketService: SocketService) {
  }

  ngOnInit() {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socketService.initSocket();
    this.socketService.onAction<number>('startTable')
      .subscribe((tableId) => {
        this.tableId = tableId;
        this.inGame = true;
      });

  }
  handleJoinTable(tableInfo: any) {
    this.onJoinTable.emit(tableInfo);
  }

}
