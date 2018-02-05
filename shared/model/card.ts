import { ElementRef } from "../../client/node_modules/@angular/core/src/linker/element_ref";

export class Card {
  isSelected: boolean;
  state = "inHand";
  face = 'down';
  cardFlipping = 'in';
  imageSrc: string;
  storedImageSrc: string;
  backImageSrc = 'back.png';
  leftPos: number;


public constructor(readonly suit: string, readonly description: string, readonly sort: number) {
  this.storedImageSrc = this.setImageString(suit, sort);
  this.imageSrc = this.backImageSrc;
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

public play() {
  this.state = 'played';
}

public flip() {
  this.face = this.face === 'up' ? 'down' : 'up';
  this.cardFlipping = 'out';
}

public onFlipDone() {
  if (this.cardFlipping === 'out' ) {
      this.imageSrc = this.face === 'up' ? this.storedImageSrc : this.backImageSrc;
      this.cardFlipping = 'in';
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
