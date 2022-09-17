import { Component, OnDestroy, OnInit } from '@angular/core';
import { LessonControllerProviderService } from '../lesson-controller-provider/lesson-controller-provider.service';

@Component({
  selector: 'app-lesson-status-view',
  templateUrl: './lesson-status-view.component.html',
  styleUrls: ['./lesson-status-view.component.scss']
})
export class LessonStatusViewComponent implements OnInit, OnDestroy {
  private _refreshTimer: any;
  terminalCount: number = 0;

  constructor(private _lessonControllerProvider: LessonControllerProviderService) {

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

}
