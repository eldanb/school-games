import { Component, OnInit } from '@angular/core';
import { LessonTerminalProviderService } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';
import { TerminalGamesRegistry } from '../TerminalGamesRegistry';

@Component({
  templateUrl: './empty-terminal-game-page.component.html',
  styleUrls: ['./empty-terminal-game-page.component.scss']
})
export class EmptyTerminalGamePageComponent implements OnInit {
  gameTitle: string;

  constructor(private _lessonTerminalProviderService: LessonTerminalProviderService) { }

  ngOnInit(): void {
    this.gameTitle = TerminalGamesRegistry[this._lessonTerminalProviderService.currentGameType!].gameTitle;
  }
}
