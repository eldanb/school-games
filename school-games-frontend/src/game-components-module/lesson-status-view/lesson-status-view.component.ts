import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LessonControllerProviderService } from '../lesson-controller-provider/lesson-controller-provider.service';
import { LessonJoinQrcodeDialogComponent, LessonJoinQrcodeDialogData } from '../lesson-join-qrcode-dialog/lesson-join-qrcode-dialog.component';

@Component({
  selector: 'app-lesson-status-view',
  templateUrl: './lesson-status-view.component.html',
  styleUrls: ['./lesson-status-view.component.scss']
})
export class LessonStatusViewComponent implements OnInit, OnDestroy {
  private _refreshTimer: any;

  showStatusPopup: boolean = false;
  terminalCount: number = 0;

  constructor(private _lessonControllerProvider: LessonControllerProviderService,
              private _matDialog: MatDialog) {

  }

  ngOnDestroy(): void {
    if(this._refreshTimer) {
      clearInterval(this._refreshTimer);
    }
  }

  ngOnInit(): void {
    this._refreshTimer = setInterval(() => this._refreshStatus(), 5000);
    this._refreshStatus();
  }

  private async _refreshStatus(): Promise<void> {
    const lessonController = await this._lessonControllerProvider.getLessonController();
    const lessonStatus = await lessonController.getLessonStatus();
    this.terminalCount = lessonStatus.terminalInfo.length;
  }

  handleIconClicked() {
    this.showStatusPopup = !this.showStatusPopup;
  }

  public async showLessonQrCode() {
    const lessonController = await this._lessonControllerProvider.getLessonController();

    this._matDialog.open<LessonJoinQrcodeDialogComponent, LessonJoinQrcodeDialogData>(
      LessonJoinQrcodeDialogComponent,
      {
        data: {
          qrCodeUrl: await lessonController.getConnectionQrCodeUrl()
        }
      });
  }

}
