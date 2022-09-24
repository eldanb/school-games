import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type LessonJoinQrcodeDialogData = {
  qrCodeUrl: string;
};

@Component({
  templateUrl: './lesson-join-qrcode-dialog.component.html',
  styleUrls: ['./lesson-join-qrcode-dialog.component.scss']
})
export class LessonJoinQrcodeDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: LessonJoinQrcodeDialogData,
              private _dialogRef: MatDialogRef<LessonJoinQrcodeDialogComponent>)  {

  }

  ngOnInit(): void {
  }

  handleCloseClick() {
    this._dialogRef.close();
  }
}
