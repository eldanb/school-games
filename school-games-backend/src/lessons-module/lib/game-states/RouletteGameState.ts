import { Logger } from '@nestjs/common';
import {
  GameListenerRegistration,
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
  private _terminalServices: WordRouletteTerminalServices[] = [];
  private _logger = new Logger('roulette-game-state');

  public state: RouletteWheelState[] = [];

  getConsoleServices(): WordRouletteConsoleInterface {
    return this;
  }

  getTerminalServices(
    terminalId: string,
    terminal: Terminal,
  ): WordRouletteTerminalInterface {
    const ret = new WordRouletteTerminalServices(this);
    this._terminalServices.push(ret);
    return ret;
  }

  async setRouletteResults(results: RouletteWheelState[]): Promise<void> {
    this.state = results;
    this._terminalServices.forEach(async (ts) => {
      if (ts.listener) {
        try {
          await ts.listener.listener.notifyRollResults(results);
        } catch (e: any) {
          this._logger.warn(`Can't notify game terminal listener: ${e}`);
        }
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifyDeletedTerminal(terminalId: string, terminal: Terminal): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifyNewTerminal(terminalId: string, terminal: Terminal): void {}
}

class WordRouletteTerminalServices implements WordRouletteTerminalInterface {
  private _listener: GameListenerRegistration | null;

  constructor(private _gs: RouletteGameState) {}

  async registerTerminalGameListener(
    gameListenerRegistration: GameListenerRegistration,
  ) {
    this._listener = gameListenerRegistration;
  }

  get listener(): GameListenerRegistration | null {
    return this._listener;
  }
}
