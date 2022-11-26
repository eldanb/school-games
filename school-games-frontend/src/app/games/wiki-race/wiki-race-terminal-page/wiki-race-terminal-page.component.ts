import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { duration } from 'moment';
import { WikiRaceRound, WikiRaceRoundResults, WikiRaceTerminalListener, WikiRaceTerminalListenerRegistration, WikiRaceTerminalPath, WikiRaceTerminalServices } from 'school-games-common';
import { LessonTerminalProviderService } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';
import { ScoreBoardColumnDefinition, ScoreBoardEntry } from 'src/game-components-module/score-board-view/score-board-view.component';

@Component({
  templateUrl: './wiki-race-terminal-page.component.html',
  styleUrls: ['./wiki-race-terminal-page.component.scss']
})
export class WikiRaceTerminalPageComponent implements OnInit, OnDestroy, WikiRaceTerminalListener {
  private _gameServices: WikiRaceTerminalServices;
  private _onMessageHandler: any;

  @ViewChild('wikiFrame')
  private _wikiFrame: ElementRef<HTMLIFrameElement>;

  startTime: number;
  terminalPath: WikiRaceTerminalPath = [];
  currentRound: WikiRaceRound | null;
  roundResultsScoreboardEntries: ScoreBoardEntry[] | null;

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

  constructor(private _terminalServices: LessonTerminalProviderService) {
    this._gameServices = this._terminalServices.currentGameServices as WikiRaceTerminalServices;
  }

  ngOnInit(): void {
    const reg = new WikiRaceTerminalListenerRegistration();
    reg.listener = this;
    this._gameServices.setListener(reg);


    this._onMessageHandler = (messageEvent: any) => {
      if(messageEvent.data.type === 'wikiDefinitionLoaded') {
        this.handleIFrameDefinitionNavigation(messageEvent.data);
      }
    }

    window.addEventListener("message", this._onMessageHandler, false);
  }

  ngOnDestroy(): void {
    window.removeEventListener("message", this._onMessageHandler);
  }

  async startRound(round: WikiRaceRound, startTime: number, endTime: number): Promise<void> {
    console.log("Start round requested "+ round.startTerm);
    this.terminalPath = [];
    this.currentRound = round;
    this.startTime = startTime;
    this.roundResultsScoreboardEntries = null;
    this.navigateToTerm(this.currentRound.startTerm);
  }

  async endRound(roundResults: WikiRaceRoundResults): Promise<void> {
    console.log("End round requested");
    this.roundResultsScoreboardEntries = roundResults.rankedTerminalStatus.map((rankedTerminal, rankIndex) => {
      return {
        username: rankedTerminal.username,
        avatar: rankedTerminal.avatar,
        terminalId: rankedTerminal.username,
        additionalFields: [
          rankedTerminal.currentScore,
          rankedTerminal.reachedEndTerm && duration(rankedTerminal.reachedEndTerm - this.startTime, 'millisecond')
              .format('mm:ss', { trim: false })
        ],
        class: [rankedTerminal.reachedEndTerm ? 'scoreboard-row-completed' : '',
                rankIndex === roundResults.userRank ? 'scoreboard-row-current-user': ''].join(' ')
      }
    });
  }

  private navigateToTerm(term: string) {
    this._wikiFrame.nativeElement.src = `/p/wiki/${term}`;
  }

  async handleIFrameDefinitionNavigation(navigationEvent: any) {
    if(!this.terminalPath.length ||
        this.terminalPath[this.terminalPath.length-1].term !== navigationEvent.definition) {
      this.terminalPath = await this._gameServices.notifyVisitToTerm(navigationEvent.definition);
    }
  }

  async backtrackToIndex(index: number) {
    this.terminalPath = await this._gameServices.notifyBacktrack(index);
    this.navigateToTerm(this.terminalPath[this.terminalPath.length-1].term);
  }

  get isPreRound(): boolean {
    return !!this.currentRound && this.startTime > Date.now();
  }

  get isOnEndTerm(): boolean {
    return this.terminalPath[this.terminalPath.length-1].term === this.currentRound?.endTerm;
  }
}
