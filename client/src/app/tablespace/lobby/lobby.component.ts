import { Component, OnInit } from '@angular/core';
import { SocketService } from 'app/shared/services/socket.service';
import { User, Table } from '../../../../../shared/model';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'mcg-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  lobbyTables: Table[];
  displayedColumns = ['north', 'south', 'east', 'west'];
  dataSource: MatTableDataSource<Table>;

  constructor(private socketService: SocketService) { }

  ngOnInit() {

    this.dataSource = new MatTableDataSource<Table>(this.lobbyTables);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socketService.initSocket();
    this.socketService.onAction<Array<Table>>('lobbyState')
      .subscribe((lobbyState) => {
        // bind data to mat table
        this.populateLobby(lobbyState);
      });
  }


  private populateLobby(lobbyState: Table[]) {
    this.lobbyTables = lobbyState;
  }
}
