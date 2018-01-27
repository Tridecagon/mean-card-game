import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { ScrollGlueDirective } from './scroll-glue.directive';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [ 
    MaterialModule 
  ],
  declarations: [ScrollGlueDirective]
})
export class SharedModule { }
