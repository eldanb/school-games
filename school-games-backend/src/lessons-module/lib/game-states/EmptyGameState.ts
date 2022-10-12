import { Terminal } from 'school-games-common';
import { GameState } from '../GamesState';

export class EmptyGameState extends GameState {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifyDeletedTerminal(terminalId: string, terminal: Terminal): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifyNewTerminal(terminalId: string, terminal: Terminal): void {}

  getConsoleServices(): object {
    return null;
  }

  getTerminalServices(terminalId: string, terminal: Terminal): object {
    return null;
  }
}
