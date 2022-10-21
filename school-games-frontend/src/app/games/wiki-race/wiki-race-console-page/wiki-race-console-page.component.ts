import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LessonStatusTerminalInfo, WikiRaceConsoleServices, WikiRaceGameStatus, WikiRaceTerminalStatus } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';

@Component({
  templateUrl: './wiki-race-console-page.component.html',
  styleUrls: ['./wiki-race-console-page.component.scss']
})
export class WikiRaceConsolePageComponent implements OnInit {
  public selectedStartTerm: string = "נדנדה";
  public selectedEndTerm: string = "סרפד";

  private _wikiRaceConsoleController: WikiRaceConsoleServices;
  private _refreshTimer: any;

  public terminals: LessonStatusTerminalInfo[];
  public gameStatus: WikiRaceGameStatus | null;

  constructor(private _lessonControllerProviderService: LessonControllerProviderService) { }

  ngOnInit(): void {
    this._startGame();
    this._refreshTimer = setInterval(() => this.refreshGameStatus(), 1000);
    this.refreshGameStatus();
  }

  ngOnDestroy(): void {
    if(this._refreshTimer) {
      clearInterval(this._refreshTimer);
    }
  }

  terminalInfoForTid(tid: string): LessonStatusTerminalInfo | null {
    return this.terminals.find((t) => t.terminalId === tid) || null;
  }

  get rankedTerminals(): [string, WikiRaceTerminalStatus][] {
    const ret = Object.entries(this.gameStatus!.terminalStatus);
    ret.sort((a, b) => a[1].currentScore - b[1].currentScore);
    return ret;
  }

  private async refreshGameStatus() {
    const terminalController = await this._lessonControllerProviderService.getLessonController();
    this.terminals = (await terminalController.getLessonStatus()).terminalInfo;

    this.gameStatus = await this._wikiRaceConsoleController.getGameStatus();
  }

  private async _startGame() {
    const lessonControlelr = await this._lessonControllerProviderService.getLessonController();
    const result = await lessonControlelr.startGame('wiki-race');
    this._wikiRaceConsoleController = result.gameController as WikiRaceConsoleServices;
  }

  public async startRound() {
    await this._wikiRaceConsoleController.startRound({
      startTerm: this.selectedStartTerm,
      endTerm: this.selectedEndTerm
    }, new Date().getTime() + 5000, new Date().getTime() + 555000)
  }
}
