import { Component, OnInit, Input } from '@angular/core';
import { SocketService } from 'app/shared/services/socket.service';
import { User, Table, GameType } from '../../../../../shared/model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mcg-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  @Input() user: User;
  lobbyTables: Table[];
  displayedColumns = ['North', 'South', 'East', 'West', 'gameType', 'start'];
  dataSource: MatTableDataSource<Table>;
  gameTypes: any;

  constructor(private socketService: SocketService) {
    this.gameTypes = GameType.values();
   }

  ngOnInit() {

    this.dataSource = new MatTableDataSource<Table>(this.lobbyTables);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socketService.initSocket();
    this.socketService.onAction<Array<Table>>('lobbyState')
      .subscribe((lobbyState) => {
        // bind data to mat table
        this.lobbyTables = lobbyState;
      });
  }

  private onStartClick(table: number) {
    this.socketService.sendAction('requestStartTable', {table});
  }

  private onSeatClick(table: number, seat: number) {
    console.log(`Table ${table} Seat ${seat}`);
    this.socketService.sendAction('requestSeat', {'table': table, 'seat': seat});
  }

  private onGameSelected(tableId: number, value: GameType) {
    console.log(`Game change event Table ${tableId} Value ${value} `);
    this.socketService.sendAction('selectGame', {table: tableId, gameType: GameType[value]});
  }

  private isMyTable(table: Table): boolean {
    return table.users.some(u => u && u.id === this.user.id);
  }

  private getGameType(table: Table): string {
    if (table && table.gameType) {
      return GameType[table.gameType];
    }
    return '';
  }

}
