import { ConfigService } from '@nestjs/config';
import {
  GameStartResult,
  LessonControllerInterface,
  LessonControllerMessage,
  LessonStatus,
  LessonTerminalServices,
  LiveObjectMonikerResolver,
  Terminal,
  TerminalConnectionInfo,
  TerminalConnectionResult,
  TerminalMessage,
  WeakObjectMonikerResolver,
  ZipClientTransport,
} from 'school-games-common';
import * as QRCode from 'qrcode';
import { Logger } from '@nestjs/common';
import { GameType } from 'school-games-common/dist/lesson-model/games-registry';
import { GameState } from './GamesState';
import { createLessonState } from './GameStatesRegistry';
import { randomUUID } from 'crypto';
import { EndpointMultiplexingZipcTransport } from 'src/zipc-module/ZipcApiController';

export class LessonControllerImpl implements LessonControllerInterface {
  private _terminalConnectionService: LessonTerminalServices;
  private _terminals: TerminalImpl[] = [];

  private _gameState: GameState | null;
  private _gameType: GameType | null;

  private _pendingMessages: AsyncQueue<LessonControllerMessage> =
    new AsyncQueue();

  private heartbeatTimeout = 10000;

  constructor(private _configService: ConfigService) {
    this._terminalConnectionService = new LessonTerminalServicesImpl(this);
  }

  async hearbeat(): Promise<LessonControllerMessage[]> {
    return await this._pendingMessages.dequeueAll(3000);
  }

  async getLessonStatus(): Promise<LessonStatus> {
    this._pruneTerminals();

    return {
      terminalInfo: this._terminals.map((terminal) => ({
        terminalId: terminal.id,
        username: terminal.username,
      })),
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
    terminalId: string,
    terminalConnectionInfo: TerminalConnectionInfo,
  ): Promise<Terminal> {
    this._pruneTerminals();

    const terminal = new TerminalImpl(this, terminalId, terminalConnectionInfo);
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
    const terminalGameState = this._gameState.getTerminalServices(
      terminal.id,
      terminal,
    );

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

    const terminalId = randomUUID();
    result.terminal = await this._owner.connectTerminal(
      terminalId,
      terminalConnectionInfo,
    );
    result.terminalId = terminalId;
    return result;
  }
}

class TerminalImpl implements Terminal {
  private _logger = new Logger('TerminalImpl');
  private _lastHeartbeat: number;
  private _transport: ZipClientTransport;
  private _pendingMessages: AsyncQueue<TerminalMessage> = new AsyncQueue();
  private _username: string;

  constructor(
    private _parent: LessonControllerImpl,
    private _id: string,
    connectionInfo: TerminalConnectionInfo,
  ) {
    this._lastHeartbeat = Date.now();
    this._transport = new TerminalZipcClientTransport(this);
    this._username = connectionInfo.username;
    EndpointMultiplexingZipcTransport.registerEndpoint(
      this._id,
      this._transport,
    );
  }

  async heartbeat(): Promise<TerminalMessage[] | null> {
    this._lastHeartbeat = Date.now();

    return (await this._pendingMessages.dequeueAll(3000)) || [];
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get lastHeartbeat(): number {
    return this._lastHeartbeat;
  }

  postMessage(message: TerminalMessage): void {
    this._pendingMessages.postMessage(message);
  }
}

class TerminalZipcClientTransport implements ZipClientTransport {
  constructor(private _terminal: TerminalImpl) {}

  async transact(moniker: string, request: string): Promise<string> {
    this._terminal.postMessage({ type: 'zipc-dispatch', zipcMessage: request });
    return '{"success": null}';
  }
}

class AsyncQueue<MessageType> {
  private _pendingMessages: MessageType[] = [];

  private _queueReady: Promise<void> | null = null;
  private _queueReadySignal: () => void | null;

  async dequeueAll(timeout: number): Promise<MessageType[] | null> {
    const timeoutError = {};
    let timeoutHandle: any;

    const timeoutPromise = new Promise((accept, reject) => {
      timeoutHandle = setTimeout(() => reject(timeoutError), timeout);
    });

    try {
      while (!this._pendingMessages.length) {
        if (this._queueReady == null) {
          this._queueReady = new Promise((accept, reject) => {
            this._queueReadySignal = accept;
          });
        }

        try {
          await Promise.race([this._queueReady, timeoutPromise]);
        } catch (e) {
          if (e == timeoutError) {
            return null;
          } else {
            throw e;
          }
        }
      }

      const ret = this._pendingMessages;
      this._pendingMessages = [];
      return ret;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  postMessage(message: MessageType): void {
    this._pendingMessages.push(message);

    if (this._queueReadySignal) {
      const sigFn = this._queueReadySignal;
      this._queueReady = null;
      this._queueReadySignal = null;

      sigFn();
    }
  }
}
