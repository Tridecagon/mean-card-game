import { Card } from '../../../../../shared/model/card';

export class UiCard {
  isSelected: boolean;
  imageSrc: string;
  leftPos: number;


public constructor(public card?: Card, public face = 'down') {
  if (card) {
    this.imageSrc = this.getImageString();
  }
  this.isSelected = false;
}

public static fullCardBackImage(): string {
  return './assets/img/deck/back.png';
}

public static cardBackImage(): string {
    return 'back.png';
}

public toString(): string {
    return this.card.description + ' of ' + this.card.suit + 's';
  }

public toggleSelection(): void {
  this.isSelected = !this.isSelected;
}

public flip(): void {
  if (this.card) {
  this.face = this.face === 'up' ? 'down' : 'up';
  }
}

public getFullImageString(): string {
  return './assets/img/deck/' + this.getImageString();
}

// TODO: refactor this to use Description, or pass true Sort along with numeric rank
private getImageString(): string {
  let value;
  switch (this.card.sort) {
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
        value = this.card.sort;
    }
    return this.card.suit.toLowerCase() + '-' + value + '.png';
  }
}
