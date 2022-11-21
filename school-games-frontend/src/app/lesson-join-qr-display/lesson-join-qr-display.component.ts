import { Component, OnInit } from '@angular/core';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';

@Component({
  selector: 'app-lesson-join-qr-display',
  templateUrl: './lesson-join-qr-display.component.html',
  styleUrls: ['./lesson-join-qr-display.component.scss']
})
export class LessonJoinQrDisplayComponent implements OnInit {

  connectionQrCodeUrl: string | null;
  connectionUrl: string | null;

  constructor(private _lessonControllerProvider: LessonControllerProviderService) { }

  ngOnInit(): void {
    this.loadConnectionQr();
  }

  private async loadConnectionQr(): Promise<void> {
    const lessonController = await this._lessonControllerProvider.getLessonController();
    this.connectionQrCodeUrl = await lessonController.getConnectionQrCodeUrl();
    this.connectionUrl = await lessonController.getConnectionUrl();
  }

}
