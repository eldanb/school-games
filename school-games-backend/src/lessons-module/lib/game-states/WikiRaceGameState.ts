import {
  Terminal,
  WikiRaceConsoleServices,
  WikiRaceGameStatus,
  WikiRaceRound,
  WikiRaceTerminalListenerRegistration,
  WikiRaceTerminalPath,
  WikiRaceTerminalServices,
  WikiRaceTerminalStatus,
} from 'school-games-common';
import { GameState } from '../GamesState';
import { LessonControllerImpl } from '../LessonControllerImpl';

export class WikiRaceGameState
  extends GameState
  implements WikiRaceConsoleServices
{
  private _terminalServices: Record<string, WikiRaceTerminalServicesImpl> = {};

  private _currentRound: WikiRaceRound | null;
  private _endTime: number | null;

  constructor(_lessonController: LessonControllerImpl) {
    super(_lessonController);

    // TOOD better start round
    setTimeout(
      () => this.startRound({ startTerm: 'שלום', endTerm: 'בננה' }, 5000),
      3000,
    );
  }

  getConsoleServices(): WikiRaceConsoleServices {
    return this;
  }

  async getGameStatus(): Promise<WikiRaceGameStatus> {
    const terminalStatus: { [terminalId: string]: WikiRaceTerminalStatus } = {};

    Object.entries(this._terminalServices).forEach(([terminalId, terminal]) => {
      terminalStatus[terminalId] = {
        termHistory: terminal.definitionHistory,
        currentScore: terminal.definitionHistory.reduce(
          (a, h) => a + h.weight,
          0,
        ),
      };
    });

    return {
      currentRound: this._currentRound,
      roundEndTime: this._endTime,
      terminalStatus: terminalStatus,
    };
  }

  getTerminalServices(
    terminalId: string,
    terminal: Terminal,
  ): WikiRaceTerminalServices {
    if (!this._terminalServices[terminalId]) {
      this._terminalServices[terminalId] = new WikiRaceTerminalServicesImpl(
        this,
        terminalId,
      );
    }

    return this._terminalServices[terminalId];
  }

  async startRound(
    roundDefinition: WikiRaceRound,
    endTime: number,
  ): Promise<void> {
    this._currentRound = roundDefinition;
    this._endTime = endTime;

    await Promise.all(
      Object.values(this._terminalServices).map((ts) =>
        ts.startRound(roundDefinition, endTime),
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifyDeletedTerminal(terminalId: string, terminal: Terminal): void {
    delete this._terminalServices[terminalId];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifyNewTerminal(terminalId: string, terminal: Terminal): void {}
}

class WikiRaceTerminalServicesImpl implements WikiRaceTerminalServices {
  private _listener: WikiRaceTerminalListenerRegistration | null = null;

  private _roundDefinition: WikiRaceRound = null;
  private _definitionHistory: WikiRaceTerminalPath;

  constructor(private _gs: WikiRaceGameState, private _terminalId: string) {}

  async notifyBacktrack(toNavStep: number): Promise<WikiRaceTerminalPath> {
    if (toNavStep >= this._definitionHistory.length - 1) {
      throw new Error('Attempt to backtrack to invalid step.');
    }

    this._definitionHistory.splice(
      toNavStep + 1,
      this._definitionHistory.length,
    );

    return this._definitionHistory;
  }

  get definitionHistory() {
    return this._definitionHistory;
  }

  async notifyVisitToTerm(term: string): Promise<WikiRaceTerminalPath> {
    this._definitionHistory.push({
      term: term,
      time: new Date().getTime(),
      weight: 1,
    });

    return this._definitionHistory;
  }

  async setListener(
    listener: WikiRaceTerminalListenerRegistration,
  ): Promise<void> {
    this._listener = listener;
  }

  async startRound(round: WikiRaceRound, time: number) {
    this._roundDefinition = round;
    this._definitionHistory = [];

    if (this._listener?.listener) {
      this._listener.listener.startRound(round, time);
    }
  }
}
