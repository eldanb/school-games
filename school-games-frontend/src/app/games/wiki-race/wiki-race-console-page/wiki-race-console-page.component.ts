import { Component, OnInit } from '@angular/core';
import { duration } from 'moment';
import { WikiRaceConsoleServices, WikiRaceGameStatus, WikiRaceRound, WikiRoundType } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';
import { ScoreBoardColumnDefinition, ScoreBoardEntry } from 'src/game-components-module/score-board-view/score-board-view.component';
import { WikiRaceGameDefinition } from '../wiki-race-game-editor/wiki-race-game-editor.component';

const GAME_PREROUND_TIME_SECS = 10;
const GAME_DEFAULT_TIME_MINUTES = 5;

const DEFAULT_GAME_DEFINITION: WikiRaceGameDefinition = {
  raceTimeInMinutes: 5,
  raceType: 'best-time',
  useRandomRounds: true,
  randomRoundsDifficultyLevel: 1,
  rounds: []
};

@Component({
  templateUrl: './wiki-race-console-page.component.html',
  styleUrls: ['./wiki-race-console-page.component.scss']
})
export class WikiRaceConsolePageComponent implements OnInit {

  public wikiRaceConsoleController: WikiRaceConsoleServices;

  public consoleState: "wait_to_start_game" | "wait_for_round" | "in_round" | "wait_for_next_round" | "end" = "wait_to_start_game";
  public editing: boolean = false;

  private _gameDefinition: WikiRaceGameDefinition;
  private _currentRoundIndex: number = 0;

  private _loadNextRoundPromise: Promise<WikiRaceRound> | null;
  private _refreshTimer: any;
  private _rankedScoreboardEntries: ScoreBoardEntry[] | null;
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

  public get gameDefinition(): WikiRaceGameDefinition {
    return this._gameDefinition;
  }

  public set gameDefinition(value: WikiRaceGameDefinition) {
    if(this.consoleState === 'wait_to_start_game') {
      this._gameDefinition = value;
      this._loadNextRoundPromise = this._prepareNextRound();
    }
  }

  get rankedScoreboardEntries(): ScoreBoardEntry[] {
    if(!this._rankedScoreboardEntries) {
      this._rankedScoreboardEntries = this.gameStatus!.rankedTerminals.map(terminalId => {
        const rankedTerminal = this.gameStatus!.terminalStatus[terminalId];
        return {
          username: rankedTerminal.username,
          avatar: rankedTerminal.avatar,
          terminalId: rankedTerminal.username,
          additionalFields: [
            this.consoleState !== 'wait_to_start_game' ? rankedTerminal.currentScore : '',
            this.gameStatus && rankedTerminal.reachedEndTerm &&
              duration(rankedTerminal.reachedEndTerm - this.gameStatus.roundStartTime, 'millisecond')
                .format('mm:ss', { trim: false })
          ],
          class: rankedTerminal.reachedEndTerm ? 'scoreboard-row-completed' : ''
        }
      })
    }

    return this._rankedScoreboardEntries;
  }

  get isPreRoundTime(): boolean {
    return Boolean(this.gameStatus?.currentRound && Date.now() < this.gameStatus?.roundStartTime);
  }

  public async startRound() {
    this.consoleState = "wait_for_round";
    const nextRound = await this._loadNextRoundPromise!;

    const nowTime = Date.now();

    await this.wikiRaceConsoleController.startRound(
      nextRound,
      nowTime + GAME_PREROUND_TIME_SECS * 1000,
      nowTime + (GAME_PREROUND_TIME_SECS + (this.gameDefinition.raceTimeInMinutes ?? GAME_DEFAULT_TIME_MINUTES)*60) * 1000)
    await this._refreshGameStatus();

    this.consoleState = "in_round";
  }

  private async _refreshGameStatus() {
    if(this.wikiRaceConsoleController) {
      this.gameStatus = await this.wikiRaceConsoleController.getGameStatus();
      this._rankedScoreboardEntries = null;

      if(this.consoleState == 'in_round' &&
         (this.gameStatus.roundStatus == 'no-winners' || this.gameStatus.roundStatus == 'winners')) {
        this._endCurrentRound();
      }
    }
  }

  private _endCurrentRound() {
    this._currentRoundIndex ++;
    this._loadNextRoundPromise = this._prepareNextRound();
    this.consoleState = this._loadNextRoundPromise ? 'wait_for_next_round' : 'end';
  }

  private _prepareNextRound(): Promise<WikiRaceRound> | null {
    if(this._gameDefinition.useRandomRounds) {
      return this.wikiRaceConsoleController.generateRound(-6).then((round) => {
        round.roundType = this._gameDefinition.raceType;
        return round;
      });
    } else
    if(this._currentRoundIndex < this._gameDefinition.rounds.length) {
      const roundTerms = this._gameDefinition.rounds[this._currentRoundIndex];
      return Promise.resolve({
        startTerm: roundTerms.startTerm,
        endTerm: roundTerms.endTerm,
        roundType: this._gameDefinition.raceType
      });
    } else {
      return null;
    }
  }

  private async _startGame() {
    const lessonControlelr = await this.lessonControllerProviderService.getLessonController();
    const result = await lessonControlelr.startGame('wiki-race');
    this.wikiRaceConsoleController = result.gameController as WikiRaceConsoleServices;

    this.consoleState = "wait_to_start_game";
    this._currentRoundIndex = 0;
    this.gameDefinition = DEFAULT_GAME_DEFINITION;

    await this._refreshGameStatus();
  }


}
