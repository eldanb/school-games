import { ConfigService } from '@nestjs/config';
import {
  GameStartResult,
  LessonControllerInterface,
  LessonStatus,
  LessonTerminalServices,
  LiveObjectMonikerResolver,
  Terminal,
  TerminalConnectionInfo,
  TerminalConnectionResult,
  TerminalMessage,
  WeakObjectMonikerResolver,
} from 'school-games-common';
import * as QRCode from 'qrcode';
import { Logger } from '@nestjs/common';
import { GameType } from 'school-games-common/dist/lesson-model/games-registry';
import { GameState } from './GamesState';
import { createLessonState } from './GameStatesRegistry';

export class LessonControllerImpl implements LessonControllerInterface {
  private _terminalConnectionService: LessonTerminalServices;
  private _terminals: TerminalImpl[] = [];

  private _gameState: GameState | null;
  private _gameType: GameType | null;

  private heartbeatTimeout = 10000;

  constructor(private _configService: ConfigService) {
    this._terminalConnectionService = new LessonTerminalServicesImpl(this);
  }

  async getLessonStatus(): Promise<LessonStatus> {
    this._pruneTerminals();

    return {
      terminalInfo: this._terminals.map((terminal) => ({})),
    };
  }

  async getConnectionQrCodeUrl(): Promise<string> {
    return await QRCode.toDataURL(await this.getConnectionUrl());
  }

  async getConnectionUrl(): Promise<string> {
    const moniker = LiveObjectMonikerResolver.registerObject(
      this._terminalConnectionService,
    );
    return `${this._configService.get(
      'TERMINAL_CONNECT_URL_PREFIX',
    )}/frontend/t?mk=${moniker}`;
  }

  async getTerminalServices(): Promise<LessonTerminalServices> {
    return this._terminalConnectionService;
  }

  async connectTerminal(
    terminalConnectionInfo: TerminalConnectionInfo,
  ): Promise<Terminal> {
    this._pruneTerminals();

    const terminal = new TerminalImpl(this, terminalConnectionInfo);
    this._terminals.push(terminal);
    return terminal;
  }

  private _pruneTerminals() {
    const pruneTime = Date.now() - this.heartbeatTimeout;
    if (this._terminals.findIndex((t) => t.lastHeartbeat < pruneTime) >= 0) {
      this._terminals = this._terminals.filter(
        (t) => t.lastHeartbeat >= pruneTime,
      );
    }
  }

  broadcast(terminalMessage: TerminalMessage) {
    this._terminals.forEach((t) => t.postMessage(terminalMessage));
  }

  async startGame(gameType: GameType): Promise<GameStartResult> {
    Logger.debug(`Starting game ${gameType}`);

    this._gameState = null;
    this._gameType = null;

    this._gameState = createLessonState(gameType, this);
    this._gameType = gameType;

    const ret = new GameStartResult();
    ret.gameController = this._gameState.getConsoleServices();

    this._terminals.forEach((t) => this._joinTerminalToGameState(t));

    return ret;
  }

  private _joinTerminalToGameState(terminal: TerminalImpl) {
    const terminalGameState = this._gameState.getTerminalServices(terminal);

    terminal.postMessage({
      type: 'start-game',
      gameType: this._gameType,
      gameStateMoniker: terminalGameState
        ? WeakObjectMonikerResolver.registerObject(terminalGameState)
        : null,
    });
  }
}

class LessonTerminalServicesImpl implements LessonTerminalServices {
  constructor(private _owner: LessonControllerImpl) {}

  async connectTerminal(
    terminalConnectionInfo: TerminalConnectionInfo,
  ): Promise<TerminalConnectionResult> {
    const result = new TerminalConnectionResult();
    result.terminal = await this._owner.connectTerminal(terminalConnectionInfo);

    return result;
  }
}

class TerminalImpl implements Terminal {
  private _logger = new Logger('TerminalImpl');
  private _lastHeartbeat: number;
  private _pendingMessages: TerminalMessage[] = [];

  constructor(
    private _parent: LessonControllerImpl,
    connectionInfo: TerminalConnectionInfo,
  ) {
    this._lastHeartbeat = Date.now();
  }

  async heartbeat(): Promise<TerminalMessage[]> {
    this._lastHeartbeat = Date.now();

    const ret = this._pendingMessages;
    this._pendingMessages = [];
    return ret;
  }

  get lastHeartbeat(): number {
    return this._lastHeartbeat;
  }

  postMessage(message: TerminalMessage): void {
    this._pendingMessages.push(message);
  }
}
