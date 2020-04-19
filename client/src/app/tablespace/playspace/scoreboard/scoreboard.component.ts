
import { SocketService } from 'app/shared/services/socket.service';
import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../../../../../shared/model';

@Component({
  selector: 'mcg-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {

  scores: Object[];
  // tableArray: Object[];
  // fixedArray: Object[];
  playerNames = {round: 'Round'};
  columnIndex = ['round', 'player0', 'player1', 'player2', 'player3'];
  displayedCols = [];

  @Input() players: User[];

  constructor(private socketService: SocketService) {
 /*   this.scores = [{round: {name: 'Round', points: 1}, player1: {name: 'Bob', points: 5}, player2: {name: 'Steve', points: 3}},
     {round: {name: `Round`, points: 2}, player0: {name: 'Tom', points: -10} }]; */
     this.scores = [{Round: 1, dave: 2}, {Round: 2, mike: 5, tom: 10}];

   }

  ngOnInit() {
     this.players.map((p, i) =>
          this.playerNames[`player${i}`] = this.players[i].name
        );
      this.displayedCols = this.columnIndex.filter((c) => !!this.playerNames[c]);
    this.setupListeners();

    // this.dataSource = new MatTableDataSource<Object>(this.scores);
  }

  setupListeners() {
    this.socketService.initSocket();
/*
    this.socketService.onAction<any>('updateScores')
      .subscribe((scoreArray) => {
        this.scores = scoreArray;
    });

    */

  }
}
