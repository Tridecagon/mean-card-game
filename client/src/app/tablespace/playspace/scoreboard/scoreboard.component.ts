import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mcg-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {

  scores: Number[][];
  players: string[];
  tableArray: Object[];

  constructor() {
    this.scores = [[0, 5, 0], [-15, 0, 0], [0, 0, 10] ];
    this.players = ['last', 'second', 'first'];
   }

  ngOnInit() {
    this.tableArray = this.scores.map((s) => {
      const scoreObj = {};
      this.players.map((p, i) => scoreObj[p] = s[i]);
      return scoreObj;
    });
  }

}
