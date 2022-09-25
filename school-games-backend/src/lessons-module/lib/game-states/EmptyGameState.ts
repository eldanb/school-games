import { Terminal } from 'school-games-common';
import { GameState } from '../GamesState';

export class EmptyGameState extends GameState {
  getConsoleServices(): object {
    return null;
  }

  getTerminalServices(terminalId: string, terminal: Terminal): object {
    return null;
  }
}
