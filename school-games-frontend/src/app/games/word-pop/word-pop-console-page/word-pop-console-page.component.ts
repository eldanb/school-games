import { Component, OnDestroy, OnInit } from '@angular/core';
import { LessonStatusTerminalInfo, PoppedWordGameboard, PoppedWordGameStatus, TerminalConnectionInfo, WordPopConsoleInterface } from 'school-games-common';
import { ConsoleUiFrameworkIntegrationSupportService } from 'src/app/main-console/console-ui-framework/console-ui-framework.component';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';

@Component({
  templateUrl: './word-pop-console-page.component.html',
  styleUrls: ['./word-pop-console-page.component.scss']
})
export class WordPopConsolePageComponent implements OnInit, OnDestroy {
  private _wordpopGameController: WordPopConsoleInterface;
  private _refreshInterval: any = null;

  _wordList = [
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
  ];


  gameStatus: PoppedWordGameStatus;
  terminals: LessonStatusTerminalInfo[];
  sampleBoard: PoppedWordGameboard;



  constructor(
    private _lessonControllerService: LessonControllerProviderService,
    private _consoleUiFramework: ConsoleUiFrameworkIntegrationSupportService) { }

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
    const terminalController = await this._lessonControllerService.getLessonController();
    this.terminals = (await terminalController.getLessonStatus()).terminalInfo;

    const prevGameState = this.gameStatus?.gameState;

    this.gameStatus = await this._wordpopGameController.getGameStatus();

    if(this.gameStatus?.gameState !== prevGameState) {
      switch(this.gameStatus?.gameState) {
        case 'all-done':
          this.arrangeBaloonsByCorrectness();
          break;
      }
    }
  }

  private arrangeBaloonsByCorrectness() {
    let numCorrect = 0;
    let numWrong = 0;
    this.sampleBoard.baloons.forEach(baloon => {
      if(this._wordList.find((w) => w.word == baloon.word)?.valid) {
        baloon.position.x = 10 + (numCorrect % 2) * 40;
        baloon.position.y = 10 + numCorrect * 80;
        numCorrect++;

      } else {
        baloon.position.x = 330 + (numWrong % 2) * 40;
        baloon.position.y = 10 + numWrong * 80;
        numWrong++;
      }
    });
  }

  public terminalInfoForTid(tid: string): LessonStatusTerminalInfo | null {
    return this.terminals.find((t) => t.terminalId == tid) || null;
  }

  public async startGame() {
    this.sampleBoard = await this._wordpopGameController.startGame(
      "who did number two!?",
      this._wordList, 120);
  }
}
