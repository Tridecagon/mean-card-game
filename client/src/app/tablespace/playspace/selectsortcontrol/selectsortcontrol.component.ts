import { Component, OnInit, Input } from '@angular/core';
import { SocketService } from 'app/shared/services/socket.service';
import { Suit } from 'app/../../../shared/model';

@Component({
  selector: 'mcg-selectsortcontrol',
  templateUrl: './selectsortcontrol.component.html',
  styleUrls: ['./selectsortcontrol.component.css']
})
export class SelectsortcontrolComponent implements OnInit {

  skatGameTypes: string[];
  selectedType: string;
  constructor(private socketService: SocketService) {
    this.skatGameTypes = Object.keys(Suit).filter(
        (type) => isNaN(<any>type) && type !== 'values' && type !== 'None'
      );
      this.selectedType = Suit[Suit.Jack];
   }

  ngOnInit() {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socketService.initSocket();
    // change this; listen to hand deals and sort changes
    this.socketService.onAction('resortHand')
      .subscribe((sortData: any) => {
        // bind data to mat table
        this.selectedType = Suit[sortData.type];
      });
  }
  onSortSelected(value: Suit) {
    this.socketService.sendAction('selectSort', Suit[value]);
  }

}
