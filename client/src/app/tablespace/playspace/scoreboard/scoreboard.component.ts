
import { SocketService } from 'app/shared/services/socket.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { User } from '../../../../../../shared/model';

@Component({
  selector: 'mcg-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit, OnChanges {

  scores: Object[];
  // tableArray: Object[];
  // fixedArray: Object[];
  playerNames = {round: 'Round'};
  columnIndex = ['round', 'player0', 'player1', 'player2', 'player3'];
  displayedCols = [];

  @Input() players: User[];
  @Input() visible: boolean;

  constructor(private socketService: SocketService) {
     this.scores = [];

   }

  ngOnInit() {

    this.setupListeners();
  }

  ngOnChanges() {
    this.players.map((p, i) =>
      this.playerNames[`player${i}`] = this.players[i].name
    );
    this.displayedCols = this.columnIndex.filter((c) => !!this.playerNames[c]);
  }

  setupListeners() {
    this.socketService.initSocket();

    this.socketService.onAction<any>('updateScores')
      .subscribe((scoreArray) => {
        this.scores = scoreArray;
    });

  }

  getTotal(playerName: string): number | string {
    return playerName === 'Round' ? 'Total'
    : this.scores.reduce((acc, cur) => acc + (cur[playerName] || 0), 0);
  }
}
