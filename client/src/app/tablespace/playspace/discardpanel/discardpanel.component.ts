import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mcg-discardpanel',
  templateUrl: './discardpanel.component.html',
  styleUrls: ['./discardpanel.component.css']
})
export class DiscardpanelComponent implements OnInit {

  ready: boolean;

  @Output() onDiscard = new EventEmitter();
  constructor() { }

  ngOnInit() {
    this.ready = false;
    setTimeout(() => this.ready = true, 2000); // prevent accidental immediate click
  }

  discard() {
    this.onDiscard.emit();
  }
}
