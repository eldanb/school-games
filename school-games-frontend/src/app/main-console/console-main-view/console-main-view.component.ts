import { Component, OnInit } from '@angular/core';
import { ConsoleGamesRegistry } from 'src/app/games/ConsoleGamesRegistry';
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

  constructor() {

  }

  ngOnInit(): void {
  }

}
