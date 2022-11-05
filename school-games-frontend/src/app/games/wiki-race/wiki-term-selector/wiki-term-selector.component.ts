import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WikiRaceConsoleServices } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';
import { LessonTerminalProviderService } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';

@Component({
  selector: 'app-wiki-term-selector',
  templateUrl: './wiki-term-selector.component.html',
  styleUrls: ['./wiki-term-selector.component.scss']
})
export class WikiTermSelectorComponent implements OnInit {

  private _editedTerm: string;
  private _validationResult: boolean | null;

  spinnerEnabled: number = 0;

  randomizing: boolean = false;

  ngOnInit(): void {
  }

  @Output()
  termChange = new EventEmitter<string>();

  @Output()
  validationStateChanged = new EventEmitter<boolean | null>();

  @Input()
  disabled: boolean;

  @Input()
  gameController: WikiRaceConsoleServices;

  @Input()
  get term(): string {
    return this.editedTerm;
  }

  set term(value: string) {
    this.editedTerm = value;
  }

  get editedTerm() {
    return this._editedTerm;
  }

  set editedTerm(v: string) {
    if(v != this._editedTerm) {
      this._editedTerm = v;
      this.termChange.emit(v);
      this._revalidate();
    }
  }

  set validationResult(result: boolean | null) {
    this._validationResult = result;
    this.validationStateChanged.emit(result);
  }

  get validationResult(): boolean | null {
    return this._validationResult;
  }

  async randomizeTerm() {
    this.randomizing = true;
    this.spinnerEnabled ++;
    this._editedTerm = (await this.gameController.generateRound(0)).startTerm;
    this.spinnerEnabled --;
    this.randomizing = false;
    this.termChange.emit(this._editedTerm);
    this.validationResult = true;
  }

  private async _revalidate(): Promise<void> {
    this.validationResult = null;
    this.spinnerEnabled ++;
    if(this.gameController) {
      this.validationResult = await this.gameController.isTerm(this.editedTerm);
    }
    this.spinnerEnabled --;
  }
}
