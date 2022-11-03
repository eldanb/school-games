import { Component, OnInit } from '@angular/core';
import { WikiRaceConsoleServices, WikiRaceGameStatus } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';
import { ScoreBoardColumnDefinition, ScoreBoardEntry } from 'src/game-components-module/score-board-view/score-board-view.component';

const GAME_PREROUND_TIME_SECS = 10;
const GAME_ROUND_TIME_SECS = 60*1;

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

  private _rankedScoreboardEntries: ScoreBoardEntry[] | null;

  public gameStatus: WikiRaceGameStatus | null;

  public scoreboardColumns: ScoreBoardColumnDefinition[] = [{
    heading: "אורך",
    width: "7rem",
    class: "scoreboard-col-right"
  }];

  constructor(public lessonControllerProviderService: LessonControllerProviderService) { }

  ngOnInit(): void {
    this._startGame();
    this._refreshTimer = setInterval(() => this.refreshGameStatus(), 1000);
  }

  ngOnDestroy(): void {
    if(this._refreshTimer) {
      clearInterval(this._refreshTimer);
    }
  }

  get rankedScoreboardEntries(): ScoreBoardEntry[] {
    if(!this._rankedScoreboardEntries) {
      this._rankedScoreboardEntries = Object.values(this.gameStatus!.terminalStatus).map(t => ({
        username: t.username,
        avatar: t.avatar,
        terminalId: t.username,
        additionalFields: [t.currentScore],
        class: t.reachedEndTerm ? 'scoreboard-row-completed' : ''
      }));

      this._rankedScoreboardEntries.sort((a, b) => a.additionalFields[0] - b.additionalFields[0]);
    }

    return this._rankedScoreboardEntries;
  }

  private async refreshGameStatus() {
    if(this.wikiRaceConsoleController) {
      this.gameStatus = await this.wikiRaceConsoleController.getGameStatus();
      this._rankedScoreboardEntries = null;
    }
  }

  private async _startGame() {
    const lessonControlelr = await this.lessonControllerProviderService.getLessonController();
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

  get isPreRound(): boolean {
    return Boolean(this.gameStatus?.currentRound && Date.now() < this.gameStatus?.roundStartTime);
  }
}
