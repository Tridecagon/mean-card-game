export class Card {

  suit: string;
  description: string;
  sort?: number;
  imageString: string;
public constructor(suit: string, description: string, sort?: number) {
  this.imageString = this.setImageString(suit, sort);
}

public cardBackImage(): string {
    return 'back.png';
}

public toString = function(){
    return this.description + ' of ' + this.suit + 's';
  }


private setImageString(suit: string, sort: number): string {
    //var suit = this.suit.toLowerCase();
    var value;
    switch(sort){
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
        value = sort;
    }
    return './assets/img/deck/' + suit.toLowerCase() + '-' + value + '.png';
  }
}
