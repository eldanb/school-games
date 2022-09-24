import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouletteWheelState, WordRouletteTerminalInterface } from 'school-games-common';
import { LessonTerminalProviderService } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';

@Component({
  templateUrl: './word-roulette-terminal-page.component.html',
  styleUrls: ['./word-roulette-terminal-page.component.scss']
})
export class WordRouletteTerminalPageComponent implements OnInit, OnDestroy {
  public rouletteResults: RouletteWheelState[] = [];

  private _wordRouletteTerminal: WordRouletteTerminalInterface;
  private _refreshTimer: any = null;

  constructor(private _lessonTerminalProviderService: LessonTerminalProviderService) { }

  ngOnDestroy(): void {
    if(this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  ngOnInit(): void {
    this._wordRouletteTerminal = this._lessonTerminalProviderService.currentGameServices as WordRouletteTerminalInterface;
    this._refreshTimer = setInterval(() => this.refreshRouletteState(), 1000);
  }

  async refreshRouletteState(): Promise<void> {
    this.rouletteResults = await this._wordRouletteTerminal.getRouletteResults() || [];
  }
}
