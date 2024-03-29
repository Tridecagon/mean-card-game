import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { DialogUserType } from './dialog-user-type';

@Component({
  selector: 'mcg-dialog-user',
  templateUrl: './dialog-user.component.html',
  styleUrls: ['./dialog-user.component.css']
})
export class DialogUserComponent implements OnInit {
  usernameFormControl = new FormControl('', [Validators.required]);
  previousUsername: string;
  DialogUserType = DialogUserType;

  constructor(public dialogRef: MatDialogRef<DialogUserComponent>,
    @Inject(MAT_DIALOG_DATA) public params: any) {
    this.previousUsername = params.username ? params.username : undefined;
  }

  ngOnInit() {
  }

  public onSave(): void {
    if (this.usernameFormControl.valid) {
      this.dialogRef.close({
        username: this.usernameFormControl.value,
        dialogType: this.params.dialogType,
        previousUsername: this.previousUsername
      });
    }
  }
}
