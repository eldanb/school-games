import { Component, OnDestroy, OnInit } from '@angular/core';
import { PoppedWordGameStatus, WordPopConsoleInterface } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';

@Component({
  templateUrl: './word-pop-console-page.component.html',
  styleUrls: ['./word-pop-console-page.component.scss']
})
export class WordPopConsolePageComponent implements OnInit, OnDestroy {
  private _wordpopGameController: WordPopConsoleInterface;
  private _refreshInterval: any = null;

  gameStatus: PoppedWordGameStatus;

  constructor(private _lessonControllerService: LessonControllerProviderService) { }

  ngOnInit(): void {
    this.setupGame();
    this._refreshInterval = setInterval(() => this.refreshStatus(), 500);
  }

  ngOnDestroy(): void {
    if(this._refreshInterval != null) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  }

  get terminalIds() {
    return Object.keys(this.gameStatus.terminalStatus).filter((k) => k != '$m');
  }

  private async setupGame() {
    const lessonController = await this._lessonControllerService.getLessonController();
    const startResult = await lessonController.startGame("word-pop");
    this._wordpopGameController = startResult.gameController as WordPopConsoleInterface;
  }

  private async refreshStatus() {
    this.gameStatus = await this._wordpopGameController.getGameStatus();
  }

  public async startGame() {
    await this._wordpopGameController.startGame([
      {
        word: "שמר",
        valid: true
      },
      {
        word: "אשמור",
        valid: true
      },
      {
        word: "ישמור",
        valid: true
      },
      {
        word: "שמרים",
        valid: false
      },
      {
        word: "חלב",
        valid: false
      },
      {
        word: "תשמורנה",
        valid: true
      },
      {
        word: "שמרו",
        valid: true
      },
      {
        word: "חביצה",
        valid: false
      },
    ], 120);
  }
}
