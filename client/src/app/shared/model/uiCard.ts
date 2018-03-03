import { Card } from '../../../../../shared/model/card';

export class UiCard {
  isSelected: boolean;
  imageSrc: string;
  leftPos: number;


public constructor(public card?: Card, public face = 'down') {
  if (card) {
    this.imageSrc = this.setImageString(card.suit, card.sort);
  }
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

public flip() {
  if (this.card) {
  this.face = this.face === 'up' ? 'down' : 'up';
  }
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
    return suit.toLowerCase() + '-' + value + '.png';
  }
}
