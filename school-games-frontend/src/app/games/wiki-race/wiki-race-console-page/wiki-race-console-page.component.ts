import { Component, OnInit } from '@angular/core';
import { duration } from 'moment';
import { WikiRaceConsoleServices, WikiRaceGameStatus, WikiRoundType } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';
import { ScoreBoardColumnDefinition, ScoreBoardEntry } from 'src/game-components-module/score-board-view/score-board-view.component';

const GAME_PREROUND_TIME_SECS = 10;
const GAME_ROUND_TIME_SECS = 60*5;

@Component({
  templateUrl: './wiki-race-console-page.component.html',
  styleUrls: ['./wiki-race-console-page.component.scss']
})
export class WikiRaceConsolePageComponent implements OnInit {
  public selectedStartTerm: string = "";
  public startTermValid: boolean | null;

  public selectedEndTerm: string = "";
  public endTermValid: boolean | null;

  public selectedRoundType: WikiRoundType = 'shortest-path';

  public generatingRandomRound = false;

  public wikiRaceConsoleController: WikiRaceConsoleServices;

  private _refreshTimer: any;

  private _rankedScoreboardEntries: ScoreBoardEntry[] | null;

  public editingRound: boolean = true;

  public gameStatus: WikiRaceGameStatus | null;

  public scoreboardColumns: ScoreBoardColumnDefinition[] = [
    {
      heading: "אורך",
      width: "7rem",
      class: "scoreboard-col-right"
    },
    {
    heading: "זמן",
    width: "7rem",
    class: "scoreboard-col-right"
  }

  ];



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
        additionalFields: [
          t.currentScore,
          this.gameStatus && t.reachedEndTerm &&
            duration(t.reachedEndTerm - this.gameStatus.roundStartTime, 'millisecond')
              .format('mm:ss', { trim: false }),
          t.currentScore - (t.reachedEndTerm !== null ? 1000 : 0),
          t.reachedEndTerm],
        class: t.reachedEndTerm ? 'scoreboard-row-completed' : ''
      }));

      if(this.gameStatus?.roundStatus?.includes('winners')) {
        this._rankedScoreboardEntries =
          this._rankedScoreboardEntries.filter((e) => e.additionalFields[1] !== null);
      }

      const sortOrder =
        this.selectedRoundType === 'shortest-path'
          ? (a: ScoreBoardEntry, b: ScoreBoardEntry) => (a.additionalFields[2]  - b.additionalFields[2])
          : (a: ScoreBoardEntry, b: ScoreBoardEntry) => (a.additionalFields[3]  - b.additionalFields[3]);

      this._rankedScoreboardEntries.sort(sortOrder);
    }

    return this._rankedScoreboardEntries;
  }

  public async generateRandomRound() {
    this.generatingRandomRound = true;
    const round = await this.wikiRaceConsoleController.generateRound(-6);
    this.selectedStartTerm = round.startTerm;
    this.selectedEndTerm = round.endTerm;
    this.generatingRandomRound = false;
  }

  public async newRound() {
    this.editingRound = true;
    await this.generateRandomRound();
  }

  public async startRound() {
    const nowTime = Date.now();
    await this.wikiRaceConsoleController.startRound({
      startTerm: this.selectedStartTerm,
      endTerm: this.selectedEndTerm,
      roundType: this.selectedRoundType
    },
    nowTime + GAME_PREROUND_TIME_SECS * 1000,
    nowTime + (GAME_PREROUND_TIME_SECS + GAME_ROUND_TIME_SECS) * 1000)
    this.editingRound = false;
  }

  get isPreRound(): boolean {
    return Boolean(this.gameStatus?.currentRound && Date.now() < this.gameStatus?.roundStartTime);
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

    await this.generateRandomRound();
    await this.refreshGameStatus();

  }


}
