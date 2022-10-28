import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
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
  private _startTime: number;
  private _endTime: number | null;

  private _gameRunning: boolean;

  private _logger = new Logger('WikiRaceGameState');

  constructor(_lessonController: LessonControllerImpl) {
    super(_lessonController);
  }

  getConsoleServices(): WikiRaceConsoleServices {
    return this;
  }

  async getGameStatus(): Promise<WikiRaceGameStatus> {
    const terminalStatus: { [terminalId: string]: WikiRaceTerminalStatus } = {};

    this._updateGameRunningByTime();

    Object.entries(this._terminalServices).forEach(([terminalId, terminal]) => {
      terminalStatus[terminalId] = {
        termHistory: terminal.definitionHistory,
        currentScore: terminal.definitionHistory.reduce(
          (a, h) => a + h.weight,
          0,
        ),
        reachedEndTerm:
          terminal.definitionHistory.length &&
          this._currentRound &&
          terminal.definitionHistory[terminal.definitionHistory.length - 1]
            .term === this._currentRound.endTerm,
      };
    });

    return {
      currentRound: this._currentRound,
      roundEndTime: this._endTime,
      roundStartTime: this._startTime,
      roundRunning: this._gameRunning,
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
    startTime: number,
    endTime: number,
  ): Promise<void> {
    this._currentRound = roundDefinition;
    this._startTime = startTime;
    this._endTime = endTime;
    this._gameRunning = true;

    await Promise.all(
      Object.values(this._terminalServices).map((ts) =>
        ts.startRound(roundDefinition, startTime, endTime),
      ),
    );
  }

  async isTerm(term: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this._lessonController.httpClient.get(
          `https://he.wikipedia.org/wiki/${encodeURIComponent(term)}`,
        ),
      );

      if (response.status != 200) {
        throw new Error('Term not found');
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  async endRound() {
    this._gameRunning = false;
    await Promise.all(
      Object.values(this._terminalServices).map((ts) => ts.endRound()),
    );
  }

  async generateRound(numSteps: number): Promise<WikiRaceRound> {
    const terms = await this.generateRandomTerms(2);

    const firstTerm = terms[0];
    this._logger.debug(`First random term: ${firstTerm}`);

    const endTerm =
      numSteps <= 0
        ? terms[1]
        : await this.suggestTargetTerm(firstTerm, numSteps);

    return {
      startTerm: firstTerm,
      endTerm: endTerm,
    };
  }

  private async generateRandomTerms(numTerms: number): Promise<string[]> {
    const randomTermQuery = await firstValueFrom(
      this._lessonController.httpClient.get(
        `https://he.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=${numTerms}`,
      ),
    );

    return (randomTermQuery.data.query.random as any[]).map((r) => r.title);
  }

  private async suggestTargetTerm(
    sourceTerm: string,
    numSteps: number,
  ): Promise<string> {
    let currentTerm = sourceTerm;
    while (numSteps--) {
      const linkQuery = await firstValueFrom(
        this._lessonController.httpClient.get(
          `https://he.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            currentTerm,
          )}&prop=links&pllimit=max&format=json`,
        ),
      );

      const links: { ns: string; title: string }[] = (
        Object.values(linkQuery.data.query.pages)[0] as any
      ).links?.filter((l) => l.ns == 0);

      if (!links?.length) {
        break;
      }

      const nextLink = links[Math.floor(Math.random() * links.length)];
      currentTerm = nextLink.title;

      this._logger.debug(`Traverse to term: ${JSON.stringify(nextLink)}`);
    }

    return currentTerm;
  }

  get gameRunning(): boolean {
    this._updateGameRunningByTime();
    return this._gameRunning;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifyDeletedTerminal(terminalId: string, terminal: Terminal): void {
    delete this._terminalServices[terminalId];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifyNewTerminal(terminalId: string, terminal: Terminal): void {}

  private _updateGameRunningByTime() {
    if (this._gameRunning) {
      const checkTime = new Date().getTime();
      if (this._endTime && checkTime > this._endTime) {
        this.endRound();
      }
    }
  }

  terminalChanged(sender: WikiRaceTerminalServicesImpl) {
    if (
      !Object.values(this._terminalServices).find(
        (t) => t.currentTerm !== this._currentRound.endTerm,
      )
    ) {
      this.endRound();
    }
  }

  get playAllowed(): boolean {
    return this.gameRunning && Date.now() >= this._startTime;
  }
}

class WikiRaceTerminalServicesImpl implements WikiRaceTerminalServices {
  private _listener: WikiRaceTerminalListenerRegistration | null = null;

  private _roundDefinition: WikiRaceRound = null;
  private _definitionHistory: WikiRaceTerminalPath = [];

  constructor(private _gs: WikiRaceGameState, private _terminalId: string) {}

  async notifyBacktrack(toNavStep: number): Promise<WikiRaceTerminalPath> {
    if (!this._gs.playAllowed) {
      throw new Error('Game not running');
    }

    if (toNavStep >= this._definitionHistory.length - 1) {
      throw new Error('Attempt to backtrack to invalid step.');
    }

    this._definitionHistory.splice(
      toNavStep + 1,
      this._definitionHistory.length,
    );

    this._gs.terminalChanged(this);

    return this._definitionHistory;
  }

  get definitionHistory() {
    return this._definitionHistory;
  }

  async notifyVisitToTerm(term: string): Promise<WikiRaceTerminalPath> {
    if (this.definitionHistory.length > 0 && !this._gs.playAllowed) {
      throw new Error('Game not running');
    }

    this._definitionHistory.push({
      term: term,
      time: new Date().getTime(),
      weight: 1,
    });

    this._gs.terminalChanged(this);

    return this._definitionHistory;
  }

  get currentTerm(): string {
    return this._definitionHistory[this._definitionHistory.length - 1]?.term;
  }

  async setListener(
    listener: WikiRaceTerminalListenerRegistration,
  ): Promise<void> {
    this._listener = listener;
  }

  async endRound() {
    if (this._listener?.listener) {
      this._listener.listener.endRound();
    }
  }

  async startRound(round: WikiRaceRound, startTime: number, endTime: number) {
    this._roundDefinition = round;
    this._definitionHistory = [];

    if (this._listener?.listener) {
      this._listener.listener.startRound(round, startTime, endTime);
    }
  }
}
