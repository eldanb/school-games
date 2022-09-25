import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';

@Component({
  templateUrl: './console-main-view.component.html',
  styleUrls: ['./console-main-view.component.scss']
})
export class ConsoleMainViewComponent implements OnInit {

  connectionQrCodeUrl: string | null;
  connectionUrl: string | null;
  gameDescriptors = [
    {
      name: 'רולטת מילים',
      id: 'word-roulette'
    },
    {
      name: 'בלוני מילים',
      id: 'word-pop'
    }
  ]
  constructor(private _lessonControllerProvider: LessonControllerProviderService) {

  }

  ngOnInit(): void {
    this.loadConnectionQr();
  }

  private async loadConnectionQr(): Promise<void> {
    const lessonController = await this._lessonControllerProvider.getLessonController();
    this.connectionQrCodeUrl = await lessonController.getConnectionQrCodeUrl();
    this.connectionUrl = await lessonController.getConnectionUrl();
  }
}
