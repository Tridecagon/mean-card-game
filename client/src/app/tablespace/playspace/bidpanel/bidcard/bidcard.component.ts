import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User } from '../../../../../../../shared/model';
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
  @Input() maxBid: number;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
  }

  sendBid(i: number) {
    if (this.canBid) {
      const bidVal = this.ParseBid(this.myFormControl.value);
      if (bidVal >= 0) {
        this.socketService.sendAction('bidRequest', {'bid': bidVal});
      }
    }
  }

  ParseBid(bidStr: string): number {
    // returns -1 if error

    const bid = Number(bidStr);
    const valid = /^\d+$/.test(bidStr) && !Number.isNaN(bid) && bid >= 0 && bid <= this.maxBid;
    return valid ? bid : -1;
  }

}
