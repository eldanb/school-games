import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WikiRaceRound, WikiRaceTerminalListener, WikiRaceTerminalListenerRegistration, WikiRaceTerminalPath, WikiRaceTerminalServices } from 'school-games-common';
import { LessonTerminalProviderService } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';

@Component({
  templateUrl: './wiki-race-terminal-page.component.html',
  styleUrls: ['./wiki-race-terminal-page.component.scss']
})
export class WikiRaceTerminalPageComponent implements OnInit, OnDestroy, WikiRaceTerminalListener {
  private _gameServices: WikiRaceTerminalServices;
  private _onMessageHandler: any;

  @ViewChild('wikiFrame')
  private _wikiFrame: ElementRef<HTMLIFrameElement>;

  terminalPath: WikiRaceTerminalPath = [];
  currentRound: WikiRaceRound | null;

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

  async startRound(round: WikiRaceRound, endTime: number): Promise<void> {
    console.log("Start round requested "+ round.startTerm);
    this.terminalPath = [];
    this.currentRound = round;
    this.navigateToTerm(this.currentRound.startTerm);
  }

  async endRound(): Promise<void> {
    console.log("End round requested");
    this.currentRound = null;
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
}
