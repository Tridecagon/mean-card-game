import { Card } from '../../../../../shared/model/card';

export class UiCard {
  isSelected: boolean;
  imageSrc: string;
  leftPos: number;
  private _card: Card;


public constructor(card?: Card, public face = 'down') {
  this.card = card;
  this.isSelected = false;
}

set card(val: Card) {
  this._card = val;
  if (this._card) {
    this.imageSrc = this.getImageString();
  }
}

get card(): Card {
  return this._card;
}

public static fullCardBackImage(): string {
  return './assets/img/deck/back.png';
}

public static cardBackImage(): string {
    return 'back.png';
}

public toString(): string {
    return this._card.description + ' of ' + this._card.suit + 's';
  }

public toggleSelection(): void {
  this.isSelected = !this.isSelected;
}

public flip(): void {
  if (this._card) {
  this.face = this.face === 'up' ? 'down' : 'up';
  }
}

public getFullImageString(): string {
  return './assets/img/deck/' + this.getImageString();
}

// TODO: refactor this to use Description, or pass true Sort along with numeric rank
private getImageString(): string {
  if (!this._card) {
    return 'blank.png';
  }
  let value;
  switch (this._card.sort) {
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
        value = this._card.sort;
    }
    return this._card.suit.toLowerCase() + '-' + value + '.png';
  }
}
