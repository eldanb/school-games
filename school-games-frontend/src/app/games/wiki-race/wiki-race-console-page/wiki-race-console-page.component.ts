import { Component, OnInit } from '@angular/core';
import { duration } from 'moment';
import { WikiRaceConsoleServices, WikiRaceGameStatus, WikiRaceRound, WikiRoundType } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';
import { ScoreBoardColumnDefinition, ScoreBoardEntry } from 'src/game-components-module/score-board-view/score-board-view.component';

const GAME_PREROUND_TIME_SECS = 10;
const GAME_ROUND_TIME_SECS = 20; //60*5;

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

  public consoleState: "edit" | "wait_to_start_game" | "wait_for_round" | "in_round" | "wait_for_next_round" | "end" = "wait_to_start_game";
  private _loadNextRoundPromise: Promise<WikiRaceRound>;

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
    this._refreshTimer = setInterval(() => this._refreshGameStatus(), 1000);
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
          this.consoleState !== 'wait_to_start_game' ? t.currentScore : '',
          this.gameStatus && t.reachedEndTerm &&
            duration(t.reachedEndTerm - this.gameStatus.roundStartTime, 'millisecond')
              .format('mm:ss', { trim: false }),
          t.currentScore - (t.reachedEndTerm !== null ? 1000 : 0),
          t.reachedEndTerm],
        class: t.reachedEndTerm ? 'scoreboard-row-completed' : ''
      }));

      /*if(this.gameStatus?.roundStatus?.includes('winners')) {
        this._rankedScoreboardEntries =
          this._rankedScoreboardEntries.filter((e) => e.additionalFields[1] !== null);
      }*/

      const sortOrder =
        this.selectedRoundType === 'shortest-path'
          ? (a: ScoreBoardEntry, b: ScoreBoardEntry) => (a.additionalFields[2]  - b.additionalFields[2])
          : (a: ScoreBoardEntry, b: ScoreBoardEntry) => (a.additionalFields[3]  - b.additionalFields[3]);

      this._rankedScoreboardEntries.sort(sortOrder);
    }

    return this._rankedScoreboardEntries;
  }

  get isPreRoundTime(): boolean {
    return Boolean(this.gameStatus?.currentRound && Date.now() < this.gameStatus?.roundStartTime);
  }

  public async generateRandomRound() {
    this.generatingRandomRound = true;
    const round = await this.wikiRaceConsoleController.generateRound(-6);
    this.selectedStartTerm = round.startTerm;
    this.selectedEndTerm = round.endTerm;
    this.generatingRandomRound = false;

    return round;
  }

  public async startRound() {
    this.consoleState = "wait_for_round";
    const nextRound = await this._loadNextRoundPromise;

    const nowTime = Date.now();

    await this.wikiRaceConsoleController.startRound(
      nextRound,
      nowTime + GAME_PREROUND_TIME_SECS * 1000,
      nowTime + (GAME_PREROUND_TIME_SECS + GAME_ROUND_TIME_SECS) * 1000)
    await this._refreshGameStatus();

    this.consoleState = "in_round";
  }

  private async _refreshGameStatus() {
    if(this.wikiRaceConsoleController) {
      this.gameStatus = await this.wikiRaceConsoleController.getGameStatus();
      this._rankedScoreboardEntries = null;

      if(this.consoleState == 'in_round' &&
         this.gameStatus.roundStatus == 'no-winners' || this.gameStatus.roundStatus == 'winners') {
        this._endCurrentRound();
      }
    }
  }

  private _endCurrentRound() {
    // TODO or just fetch next round.
    this._loadNextRoundPromise = this._prepareNextRound();

    // TODO or consoleState = end 'end'
    this.consoleState = 'wait_for_next_round';
  }

  private async _prepareNextRound(): Promise<WikiRaceRound> {
    return this.wikiRaceConsoleController.generateRound(-6);
  }

  private async _startGame() {
    const lessonControlelr = await this.lessonControllerProviderService.getLessonController();
    const result = await lessonControlelr.startGame('wiki-race');
    this.wikiRaceConsoleController = result.gameController as WikiRaceConsoleServices;

    this._loadNextRoundPromise = this._prepareNextRound();
    await this._refreshGameStatus();

    this.consoleState = "wait_to_start_game";
  }


}
