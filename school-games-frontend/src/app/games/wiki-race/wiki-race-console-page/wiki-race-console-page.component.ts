import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LessonStatusTerminalInfo, WikiRaceConsoleServices, WikiRaceGameStatus, WikiRaceTerminalStatus } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';

const GAME_PREROUND_TIME_SECS = 10;
const GAME_ROUND_TIME_SECS = 60*3;

@Component({
  templateUrl: './wiki-race-console-page.component.html',
  styleUrls: ['./wiki-race-console-page.component.scss']
})
export class WikiRaceConsolePageComponent implements OnInit {
  public selectedStartTerm: string = "נדנדה";
  public selectedEndTerm: string = "סרפד";

  private _wikiRaceConsoleController: WikiRaceConsoleServices;
  private _refreshTimer: any;

  private _rankedTerminals: [string, WikiRaceTerminalStatus][] | null;

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
    if(!this._rankedTerminals) {
      this._rankedTerminals = Object.entries(this.gameStatus!.terminalStatus);
      this._rankedTerminals.sort((a, b) => a[1].currentScore - b[1].currentScore);
    }

    return this._rankedTerminals;
  }

  private async refreshGameStatus() {
    const terminalController = await this._lessonControllerProviderService.getLessonController();
    this.terminals = (await terminalController.getLessonStatus()).terminalInfo;

    this.gameStatus = await this._wikiRaceConsoleController.getGameStatus();

    this._rankedTerminals = null;
  }

  private async _startGame() {
    const lessonControlelr = await this._lessonControllerProviderService.getLessonController();
    const result = await lessonControlelr.startGame('wiki-race');
    this._wikiRaceConsoleController = result.gameController as WikiRaceConsoleServices;
  }

  public async startRound() {
    const nowTime = Date.now();
    await this._wikiRaceConsoleController.startRound({
      startTerm: this.selectedStartTerm,
      endTerm: this.selectedEndTerm
    },
    nowTime + GAME_PREROUND_TIME_SECS * 1000,
    nowTime + (GAME_PREROUND_TIME_SECS + GAME_ROUND_TIME_SECS) * 1000)
  }
}
