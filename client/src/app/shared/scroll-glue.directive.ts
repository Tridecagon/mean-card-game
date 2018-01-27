import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[scroll-glue]'
})
export class ScrollGlueDirective {

      constructor(el: ElementRef) {
          
      }
  }
