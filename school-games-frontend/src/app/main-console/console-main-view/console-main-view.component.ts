import { Component, OnInit } from '@angular/core';
import { ConsoleGamesRegistry } from 'src/app/games/ConsoleGamesRegistry';
import { environment } from 'src/environments/environment';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';

@Component({
  templateUrl: './console-main-view.component.html',
  styleUrls: ['./console-main-view.component.scss']
})
export class ConsoleMainViewComponent implements OnInit {

  connectionQrCodeUrl: string | null;
  connectionUrl: string | null;
  gameDescriptors = Object.entries(ConsoleGamesRegistry).map(([k, v]) => ({
    name: v.gameTitle,
    id: k
  }));

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
