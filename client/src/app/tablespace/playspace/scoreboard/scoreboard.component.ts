
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
  playerNames = {round: 'Round', player0: 'Bob', player1: 'Mike', player2: 'Steve'};
  columnIndex = ['round', 'player0', 'player1', 'player2', 'player3'];

  @Input() players: User[];

  constructor(private socketService: SocketService) {
 /*   this.scores = [{round: {name: 'Round', points: 1}, player1: {name: 'Bob', points: 5}, player2: {name: 'Steve', points: 3}},
     {round: {name: `Round`, points: 2}, player0: {name: 'Tom', points: -10} }]; */
     this.scores = [{Round: 0, Bob: 0, Mike: 0, Steve: 0}, {Round: 1, Mike: 2}];

   }

  ngOnInit() {
    /*
      for (const i in this.players) {
        if (this.players.hasOwnProperty(i)) {
          this.playerNames[`player${i}`] = this.players[i].name;
        }
      }
      this.playerNames['round'] = 'Round';

      */
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
