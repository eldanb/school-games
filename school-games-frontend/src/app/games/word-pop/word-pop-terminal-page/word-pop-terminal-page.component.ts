import { Component, OnInit } from '@angular/core';
import { PoppedWordGameboard, WordPopTerminalListener, WordPopTerminalListenerRegistration, WordPopTerminalServices } from 'school-games-common';
import { TerminalUiFrameworkIntegrationSupportService } from 'src/app/terminal/terminal-main-page/terminal-main-page.component';
import { LessonTerminalProviderService } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';
import { Baloon } from 'src/game-components-module/poppable-baloons/poppable-baloons.component';

@Component({
  templateUrl: './word-pop-terminal-page.component.html',
  styleUrls: ['./word-pop-terminal-page.component.scss']
})
export class WordPopTerminalPageComponent implements OnInit, WordPopTerminalListener {
  private _gameServices: WordPopTerminalServices;
  private _gameboard: PoppedWordGameboard;

  completed: boolean;

  constructor(
    private _lessonTerminalProviderService: LessonTerminalProviderService) {
  }

  async updateGameboard(gameboard: PoppedWordGameboard): Promise<void> {
    if(this._gameboard == null || this.completed) {
      this._gameboard = gameboard;
      this.completed = false;
    } else {
      gameboard.baloons.forEach((newBaloon) => {
        const existingBaloon = this._gameboard.baloons.find(b => b.word == newBaloon.word);

        if(!existingBaloon) {
          this._gameboard.baloons.push(newBaloon);
        } else {
          Object.assign(existingBaloon, newBaloon);
        }
      });
    }
  }

  async handleDoneClicked() {
    if(!this.completed) {
      this._gameServices.setCompleted();
      this.completed = true;
    }
  }

  setPrompt(prompt: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this._gameServices = this._lessonTerminalProviderService.currentGameServices as WordPopTerminalServices;

    const registration = new WordPopTerminalListenerRegistration();
    registration.listener = this;
    this._gameServices.setWordPopListener(registration);
  }

  handlePop(baloon: Baloon) {
    if(!this.completed) {
      this._gameServices.popWord(baloon.word);
    }
  }

  get gameboard(): PoppedWordGameboard {
    return this._gameboard;
  }
}
