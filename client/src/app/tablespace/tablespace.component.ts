import { ConfigService } from './../shared/services/config.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'mcg-tablespace',
  templateUrl: './tablespace.component.html',
  styleUrls: ['./tablespace.component.css']
})

export class TablespaceComponent implements OnInit {

  serverUrl = '';
  inGame = false;
  tableId: number;
  @Input() user: User;
  @Input() size: number;

  @Output() onJoinTable = new EventEmitter<{name: string, conn: SocketService}>();

  constructor(private socketService: SocketService, private http: HttpClient, private cfg: ConfigService) {
  }

  ngOnInit() {
    this.setupListeners();

    setInterval(this.keepAlive.bind(this) , 4 * 60 * 1000); // keepalive ping
  }

  private keepAlive() {
    this.http.get(this.cfg.serverUrl).subscribe();
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

  getContainerSize(): string {
    return `${this.size}%`;
  }

  getFeltHeight(): string {
    return `${this.size - 5}vh`;
  }
  getFeltMaxWidth(): string {
    return `${(this.size - 5) * 1.7}vh`;
  }

}
