import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './lesson-join-qrcode-dialog.component.html',
  styleUrls: ['./lesson-join-qrcode-dialog.component.scss']
})
export class LessonJoinQrcodeDialogComponent implements OnInit {

  constructor(private _dialogRef: MatDialogRef<LessonJoinQrcodeDialogComponent>)  {

  }

  ngOnInit(): void {
  }

  handleCloseClick() {
    this._dialogRef.close();
  }
}
