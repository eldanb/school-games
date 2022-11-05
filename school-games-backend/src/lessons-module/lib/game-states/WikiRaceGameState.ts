import { Logger } from '@nestjs/common';
import async from 'async';
import * as _ from 'lodash';
import { firstValueFrom } from 'rxjs';
import {
  Terminal,
  WikiRaceConsoleServices,
  WikiRaceGameStatus,
  WikiRaceRound,
  WikiRaceRoundStatus,
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
  private _currentWinners: Set<WikiRaceTerminalServicesImpl> = new Set();

  private _roundStatus: WikiRaceRoundStatus;

  private _logger = new Logger('WikiRaceGameState');

  constructor(_lessonController: LessonControllerImpl) {
    super(_lessonController);
  }

  getConsoleServices(): WikiRaceConsoleServices {
    return this;
  }

  async getGameStatus(): Promise<WikiRaceGameStatus> {
    const terminalStatus: { [terminalId: string]: WikiRaceTerminalStatus } = {};

    this._updateRoundStatus();

    const terminalsFromLessonStatus = _.keyBy(
      (await this._lessonController.getLessonStatus()).terminalInfo,
      (ti) => ti.terminalId,
    );

    Object.entries(this._terminalServices).forEach(([terminalId, terminal]) => {
      terminalStatus[terminalId] = {
        avatar: terminalsFromLessonStatus[terminalId].avatar,
        username: terminalsFromLessonStatus[terminalId].username,
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
      roundStatus: this._roundStatus,
      terminalStatus: terminalStatus,
    };
  }

  getTerminalServices(
    terminalId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    roundDefinition.startTerm = roundDefinition.startTerm.replace('_', ' ');
    roundDefinition.endTerm = roundDefinition.endTerm.replace('_', ' ');

    this._currentRound = roundDefinition;
    this._startTime = startTime;
    this._endTime = endTime;

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

  async onEndRound() {
    await Promise.all(
      Object.values(this._terminalServices).map((ts) => ts.onEndRound()),
    );
  }

  async generateRound(numSteps: number): Promise<WikiRaceRound> {
    const termPredicate = async (term: string) => {
      return (
        term.replace(/ \(.*\)/, '').split(' ').length < 4 &&
        !term.includes('(פירושונים)') &&
        term.length > 1 &&
        term.match(/[^0-9]/) &&
        (await this.getBacklinks(term)).length > 400
      );
    };

    if (numSteps > 0) {
      const startTerm = await this.generateRandomTerm(50, termPredicate);
      this._logger.debug(`Generate by forward prop; first term ${startTerm}`);
      const endTerm = await this.suggestTargetTerm(startTerm, numSteps);

      return {
        startTerm,
        endTerm,
      };
    } else if (numSteps < 0) {
      const endTerm = await this.generateRandomTerm(50, termPredicate);
      this._logger.debug(`Generate by back prop; end term ${endTerm}`);
      const startTerm = await this.suggestTargetTerm(endTerm, numSteps);

      return {
        startTerm,
        endTerm,
      };
    } else {
      this._logger.debug(`Generate by 2xrandom.`);
      const startTerm = await this.generateRandomTerm(50, termPredicate);
      const endTerm = await this.generateRandomTerm(50, termPredicate);

      return {
        startTerm,
        endTerm,
      };
    }
  }

  private async getLinks(term: string): Promise<string[]> {
    const linkQuery = await firstValueFrom(
      this._lessonController.httpClient.get(
        `https://he.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
          term,
        )}&prop=links&pllimit=max&format=json`,
      ),
    );

    const links: { ns: string; title: string }[] = (
      Object.values(linkQuery.data.query.pages)[0] as any
    ).links?.filter((l) => l.ns == 0);

    return links.map((link) => link.title);
  }

  private async getBacklinks(term: string): Promise<string[]> {
    this._logger.debug(`Getting backlinks for term ${term}`);

    const backlinksResponse = await firstValueFrom(
      this._lessonController.httpClient.get(
        `https://he.wikipedia.org/w/api.php?action=query&format=json&list=backlinks&bllimit=500&bltitle=${encodeURIComponent(
          term,
        )}`,
      ),
    );

    const backlinks = backlinksResponse.data.query.backlinks as any[];

    this._logger.debug(`${backlinks.length} backlinks for term ${term}`);
    return backlinks.filter((l) => l.ns === 0).map((bl) => <string>bl.title);
  }

  private async generateRandomTerm(
    batchSize: number,
    pred: (term: string) => Promise<boolean>,
  ): Promise<string> {
    do {
      const randomTermQuery = await firstValueFrom(
        this._lessonController.httpClient.get(
          `https://he.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=${batchSize}`,
        ),
      );

      const currentBatch = (randomTermQuery.data.query.random as any[]).map(
        (r) => <string>r.title,
      );

      const ret = await async.detectLimit(currentBatch, 4, pred);
      if (ret) {
        return ret;
      }
    } while (true);
  }

  private async suggestTargetTerm(
    sourceTerm: string,
    numSteps: number,
  ): Promise<string> {
    let currentTerm = sourceTerm;
    const reverse = numSteps < 0;
    if (reverse) {
      numSteps *= -1;
    }

    while (numSteps--) {
      const links = await (reverse
        ? this.getBacklinks(currentTerm)
        : this.getLinks(currentTerm));

      if (!links.length) {
        break;
      }

      currentTerm = links[Math.floor(Math.random() * links.length)];

      this._logger.debug(`Traverse to term: ${JSON.stringify(currentTerm)}`);
    }

    return currentTerm;
  }

  get roundStatus(): WikiRaceRoundStatus {
    this._updateRoundStatus();
    return this._roundStatus;
  }

  private _updateRoundStatus() {
    const oldStatus = this._roundStatus;
    const checkTime = new Date().getTime();

    if (this._roundStatus === 'no-winners' || this._roundStatus === 'winners') {
      return;
    }

    if (
      !this._currentRound ||
      (this._startTime && checkTime < this._startTime)
    ) {
      this._roundStatus = 'pre';
    } else if (
      !Object.values(this._terminalServices).find(
        (t) => t.currentTerm !== this._currentRound.endTerm,
      )
    ) {
      this._roundStatus = 'winners';
    } else if (this._endTime && checkTime > this._endTime) {
      this._roundStatus = 'no-winners';
    } else {
      this._roundStatus = 'running';
    }

    if (this._roundStatus != oldStatus) {
      if (
        this._roundStatus === 'no-winners' ||
        this._roundStatus === 'winners'
      ) {
        this.onEndRound();
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notifyDeletedTerminal(terminalId: string, terminal: Terminal): void {
    delete this._terminalServices[terminalId];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  notifyNewTerminal(terminalId: string, terminal: Terminal): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  terminalChanged(sender: WikiRaceTerminalServicesImpl) {
    this._updateRoundStatus();
  }

  get playAllowed(): boolean {
    return this.roundStatus === 'running';
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

    term = term.replace('_', ' ');

    if (
      this._definitionHistory.length > 1 &&
      this._definitionHistory[this._definitionHistory.length - 2].term == term
    ) {
      return this.notifyBacktrack(this._definitionHistory.length - 2);
    }

    this._definitionHistory.push({
      term,
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

  async onEndRound() {
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
