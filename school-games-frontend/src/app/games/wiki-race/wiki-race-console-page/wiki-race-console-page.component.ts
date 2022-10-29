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
  public selectedStartTerm: string = "";
  public startTermValid: boolean | null;

  public selectedEndTerm: string = "";
  public endTermValid: boolean | null;

  public wikiRaceConsoleController: WikiRaceConsoleServices;

  private _refreshTimer: any;

  private _rankedTerminals: WikiRaceTerminalStatus[] | null;

  public gameStatus: WikiRaceGameStatus | null;

  constructor(private _lessonControllerProviderService: LessonControllerProviderService) { }

  ngOnInit(): void {
    this._startGame();
    this._refreshTimer = setInterval(() => this.refreshGameStatus(), 1000);
  }

  ngOnDestroy(): void {
    if(this._refreshTimer) {
      clearInterval(this._refreshTimer);
    }
  }

  get rankedTerminals(): WikiRaceTerminalStatus[] {
    if(!this._rankedTerminals) {
      this._rankedTerminals = Object.values(this.gameStatus!.terminalStatus);
      this._rankedTerminals.sort((a, b) => a.currentScore - b.currentScore);
    }

    return this._rankedTerminals;
  }

  private async refreshGameStatus() {
    if(this.wikiRaceConsoleController) {
      this.gameStatus = await this.wikiRaceConsoleController.getGameStatus();
      this._rankedTerminals = null;
    }
  }

  private async _startGame() {
    const lessonControlelr = await this._lessonControllerProviderService.getLessonController();
    const result = await lessonControlelr.startGame('wiki-race');
    this.wikiRaceConsoleController = result.gameController as WikiRaceConsoleServices;

    await this._loadRandomRound();
    await this.refreshGameStatus();

  }

  private async _loadRandomRound() {
    const round = await this.wikiRaceConsoleController.generateRound(6);
    this.selectedStartTerm = round.startTerm;
    this.selectedEndTerm = round.endTerm;
  }

  public async startRound() {
    const nowTime = Date.now();
    await this.wikiRaceConsoleController.startRound({
      startTerm: this.selectedStartTerm,
      endTerm: this.selectedEndTerm
    },
    nowTime + GAME_PREROUND_TIME_SECS * 1000,
    nowTime + (GAME_PREROUND_TIME_SECS + GAME_ROUND_TIME_SECS) * 1000)
  }
}
