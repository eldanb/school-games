import {
  RouletteWheelState,
  Terminal,
  WordRouletteConsoleInterface,
  WordRouletteTerminalInterface,
} from 'school-games-common';
import { GameState } from '../GamesState';

export class RouletteGameState
  extends GameState
  implements WordRouletteConsoleInterface
{
  private _terminalServices: WordRouletteTerminalInterface =
    new WordRouletteTerminalServices(this);

  public state: RouletteWheelState[] = [];

  getConsoleServices(): WordRouletteConsoleInterface {
    return this;
  }

  getTerminalServices(terminal: Terminal): WordRouletteTerminalInterface {
    return this._terminalServices;
  }

  async setRouletteResults(results: RouletteWheelState[]): Promise<void> {
    this.state = results;
  }
}

class WordRouletteTerminalServices implements WordRouletteTerminalInterface {
  constructor(private _gs: RouletteGameState) {}

  async getRouletteResults(): Promise<RouletteWheelState[]> {
    return this._gs.state;
  }
}
