export class Card {

  suit: string;
  description: string;
  sort?: number;
  imageString: string;
  isSelected: boolean;
public constructor(suit: string, description: string, sort?: number) {
  this.imageString = this.setImageString(suit, sort);
  this.isSelected = false;
}

public cardBackImage(): string {
    return 'back.png';
}

public toString = function(){
    return this.description + ' of ' + this.suit + 's';
  }

public toggleSelection() {
  this.isSelected = !this.isSelected;
}


private setImageString(suit: string, sort: number): string {
  let value;
  switch (sort) {
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
