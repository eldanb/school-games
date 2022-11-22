import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WikiRaceConsoleServices, WikiRoundType } from 'school-games-common';


export type WikiRaceRoundTermsDefinition = {
  startTerm: string;
  endTerm: string;
}

export type WikiRaceGameDefinition = {
  raceType: WikiRoundType;
  raceTimeInMinutes: number | null;
  useRandomRounds: boolean;
  randomRoundsDifficultyLevel: number | null;
  rounds: WikiRaceRoundTermsDefinition[];
}

@Component({
  selector: 'app-wiki-race-game-editor',
  templateUrl: './wiki-race-game-editor.component.html',
  styleUrls: ['./wiki-race-game-editor.component.scss']
})
export class WikiRaceGameEditorComponent implements OnInit {

  constructor() { }

  @Input()
  gameController: WikiRaceConsoleServices;

  private _gameDefinition: WikiRaceGameDefinition = {
    raceTimeInMinutes: 3,
    raceType: 'shortest-path',
    randomRoundsDifficultyLevel: 1,
    useRandomRounds: true,
    rounds: []
  };

  @Output()
  gameDefinitionChange = new EventEmitter<WikiRaceGameDefinition>();

  observedGameDefinition: WikiRaceGameDefinition = <any>new Proxy(this, {
    set(target, p, newValue, receiver) {
        target._updateGameDefinition((d) => (<any>d)[p] = newValue);
        return true;
    },

    get(target, p, receiver) {
      return (target._gameDefinition as any)[p];
    }
  })

  @Input()
  set gameDefinition(value: WikiRaceGameDefinition) {
    Object.assign(this._gameDefinition, value);
  }

  get gameDefinition(): WikiRaceGameDefinition {
    return this._gameDefinition;
  }

  public selectedRoundIndex: number = -1;

  ngOnInit(): void {
  }

  public addRound() {
    this._updateGameDefinition(d => d.rounds.push({startTerm: '', endTerm: ''}));
  }

  public deleteRound(roundIndex: number) {
    this._updateGameDefinition(d => d.rounds.splice(roundIndex, 1));
  }

  public exchangeRounds(index1: number, index2: number) {
    this._updateGameDefinition(d => {
      const current1 = Object.assign({}, d.rounds[index1]);
      d.rounds[index1] = Object.assign({}, d.rounds[index2]);
      d.rounds[index2] = current1;
    });

    this.selectedRoundIndex = index2;
  }

  public formatTimeLabel(time: number): string {
    return `${time} דקות`
  }

  private _updateGameDefinition(mutator: (gameDefinition: WikiRaceGameDefinition) => void) {
    mutator(this._gameDefinition);
    this.gameDefinitionChange.emit(this._gameDefinition);
  }
}
