import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User, SkatUtil } from '../../../../../../../shared/model';
import { SocketService } from 'app/shared/services/socket.service';

@Component({
  selector: 'mcg-bidcard',
  templateUrl: './bidcard.component.html',
  styleUrls: ['./bidcard.component.css']
})
export class BidcardComponent implements OnInit {

  @Input() activeTurn = false;
  @Input() canBid = false;
  @Input() player: User;
  @Input() myValue: number;
  @Input() myFormControl: FormControl;
  @Input() minBid: number;
  @Input() maxBid: number;
  @Input() bidMode: string;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

  sendBid() {
    if (this.canBid) {
      const bidVal = this.ParseBid(this.myFormControl.value);
      if (bidVal >= 0) {
        this.socketService.sendAction('bidRequest', {'bid': bidVal});
      }
    }
  }

  sendPass() {
     if (this.canBid) {
        this.socketService.sendAction('bidRequest', {'bid': 0});
     }
  }

  get bidButtonText() {
    return this.bidMode === 'respond' ? 'YES' : 'BID';
  }

  get canEditBid() {
    return this.canBid && this.bidMode !== 'respond';
  }

  ParseBid(bidStr: string): number {
    // returns -1 if error

    const bid = Number(bidStr);
    let valid = /^\d+$/.test(bidStr) && !Number.isNaN(bid) && bid >= 0;
    if (this.maxBid >= 0 && bid > this.maxBid) {
      valid = false;
    }
    if (this.minBid >= 0 && bid < this.minBid && bid !== 0) {
      valid = false;
    }
    if (this.bidMode === 'Skat' && SkatUtil.invalidBids.some((b) => b === bid)) {
      valid = false;
    }
    return valid ? bid : -1;
  }

}
