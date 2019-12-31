import { Component, OnInit } from '@angular/core';

import { ChatModule } from '../chat/chat.module';
import { ChatComponent } from '../chat/chat.component';
import { SharedModule } from '../shared/shared.module';
import { TablespaceModule } from '../tablespace/tablespace.module';
import { TablespaceComponent } from '../tablespace/tablespace.component';

import { Action, Message, User } from '../../../../shared/model';
import { Channel, ChannelCollection, Event } from '../shared/model';

import { MatDialog, MatDialogRef } from '@angular/material';
import { AfterViewInit, ViewChild } from '@angular/core';

import { DialogUserComponent } from '../dialog-user/dialog-user.component';
import { DialogUserType } from '../dialog-user/dialog-user-type';
import { SocketService } from 'app/shared/services/socket.service';


const AVATAR_URL = 'https://api.adorable.io/avatars/285';

@Component({
  selector: 'mcg-mainpanel',
  templateUrl: './mainpanel.component.html',
  styleUrls: ['./mainpanel.component.css'],
  providers: [SocketService]
})



export class MainpanelComponent implements OnInit {
  action = Action;
  user: User;
  channelList = new ChannelCollection();
  dialogRef: MatDialogRef<DialogUserComponent> | null;
  defaultDialogUserParams: any = {
    disableClose: true,
    data: {
      title: 'Welcome',
      dialogType: DialogUserType.NEW
    }
  };

  @ViewChild(ChatComponent, {static: false}) chatChild: ChatComponent;

  constructor(private socketService: SocketService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.initModel();
    // Using timeout due to https://github.com/angular/angular/issues/14748
    setTimeout(() => {
      this.openUserPopup(this.defaultDialogUserParams);
    }, 0);
  }

  private openUserPopup(params): void {
    this.dialogRef = this.dialog.open(DialogUserComponent, params);
    this.dialogRef.afterClosed().subscribe(paramsDialog => {
      if (!paramsDialog) {
        return;
      }

      this.user.name = paramsDialog.username;
      if (paramsDialog.dialogType === DialogUserType.NEW) {
        this.initIoConnection();
        this.sendNotification(paramsDialog, Action.JOINED);
      } else if (paramsDialog.dialogType === DialogUserType.EDIT) {
        this.sendNotification(paramsDialog, Action.RENAME);
      }
    });
  }

  public onJoinTable(tableInfo: any) {
    this.AddChannel(tableInfo.name, tableInfo.conn);
  }

  private initIoConnection(): void {
    this.socketService.initSocket();
    this.AddChannel('lobby', this.socketService);


    this.socketService.onEvent(Event.CONNECT)
      .subscribe(() => {
        console.log('connected');
      });

    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
      });
  }

  private AddChannel(name: string, conn: SocketService) {
    this.channelList.AddChannel(new Channel(name, conn));
    this.chatChild.ngOnChanges();
  }

  private initModel(): void {
    const randomId = this.getRandomId();
    this.user = {
      id: randomId,
      avatar: `${AVATAR_URL}/${randomId}.png`
    };
  }

  private getRandomId(): number {
    return Math.floor(Math.random() * (1000000)) + 1;
  }


  public sendNotification(params: any, action: Action): void {
    let message: Message;

    if (action === Action.JOINED) {
      message = {
        from: this.user,
        action: action
      };
    } else if (action === Action.RENAME) {
      message = {
        action: action,
        content: {
          username: this.user.name,
          previousUsername: params.previousUsername
        }
      };
    }

    this.socketService.send(message);
  }

  public onClickUserInfo() {
    this.openUserPopup({
      data: {
        username: this.user.name,
        title: 'Edit Details',
        dialogType: DialogUserType.EDIT
      }
    });
  }

}
