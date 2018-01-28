export class Card {
suit: string;
description: string;
sort?: number;
imageString: './assets/img/deck/club-3.png';

public cardBackImage(): string {
    return 'back.png';
}

public toString = function(){
    return this.description + ' of ' + this.suit + 's';
  }

  /*
get imageString(): string {
    var suit = this.suit.toLowerCase();
    var value;
    switch(this.sort){
      case 11:
        value = 'J';
        break;
      case 12:
        value = 'Q';
        break;
      case 13:
        value = 'K';
        break;
      case 14:
        value = 'A';
        break;
      default:
        value = this.sort;
    }
    return './assets/img/deck/' + suit + '-' + value + '.png';
  }
  */
}
