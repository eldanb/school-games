import { ConfigService } from '@nestjs/config';
import {
  GameStartResult,
  LessonControllerInterface,
  LessonControllerMessage,
  LessonStatus,
  LessonTerminalServices,
  LiveObjectMonikerResolver,
  Terminal,
  TerminalAvatar,
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
import { HttpService } from '@nestjs/axios';

export class LessonControllerImpl implements LessonControllerInterface {
  private _terminalConnectionService: LessonTerminalServices;
  private _terminals: TerminalImpl[] = [];

  private _gameState: GameState | null = null;
  private _gameType: GameType | null = null;

  private _pendingMessages: AsyncQueue<LessonControllerMessage> =
    new AsyncQueue();

  private heartbeatTimeout: number;

  constructor(
    private _configService: ConfigService,
    private _httpClient: HttpService,
  ) {
    this._terminalConnectionService = new LessonTerminalServicesImpl(this);
    this.heartbeatTimeout =
      this._configService.get('TERMINAL_HEARTBEAT_TIMEOUT_SEC', 120) * 1000;
  }

  async sendMessage(terminalId: string, message: string): Promise<void> {
    const termImpl = this._terminals.find(
      (termImpl) => termImpl.id === terminalId,
    );

    if (!termImpl) {
      throw new Error(`Terminal ${terminalId} not found`);
    }

    termImpl.postMessage({
      messageSeq: 0,
      type: 'chat-notification',
      from: 'console',
      text: message,
    });
  }

  async hearbeat(
    messageCursor: number,
    timeoutMs: number,
  ): Promise<LessonControllerMessage[]> {
    this._pendingMessages.dequeueUntil(messageCursor);
    return await this._pendingMessages.peekAll(timeoutMs);
  }

  async getLessonStatus(): Promise<LessonStatus> {
    this._pruneTerminals();

    return {
      terminalInfo: this._terminals.map((terminal) => ({
        terminalId: terminal.id,
        username: terminal.username,
        avatar: terminal.avatar,
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

    if (this._gameState !== null) {
      this._joinTerminalToGameState(terminal);
      this._gameState.notifyNewTerminal(terminal.id, terminal);
    }

    return terminal;
  }

  private _pruneTerminals() {
    const pruneTime = Date.now() - this.heartbeatTimeout;
    let terminalIndex: number;
    while (
      (terminalIndex = this._terminals.findIndex(
        (t) => t.lastHeartbeat < pruneTime,
      )) >= 0
    ) {
      const deletedTerminal = this._terminals[terminalIndex];
      Logger.debug(
        `Pruning terminal ${deletedTerminal.id}, last heartbeat at ${deletedTerminal.lastHeartbeat}`,
        'terminal.heartbeat',
      );

      if (this._gameState !== null) {
        this._gameState.notifyDeletedTerminal(
          deletedTerminal.id,
          deletedTerminal,
        );
      }

      this._terminals.splice(terminalIndex, 1);
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
      messageSeq: 0,
      type: 'start-game',
      gameType: this._gameType,
      gameStateMoniker: terminalGameState
        ? WeakObjectMonikerResolver.registerObject(terminalGameState)
        : null,
    });
  }

  get httpClient() {
    return this._httpClient;
  }
}

class LessonTerminalServicesImpl implements LessonTerminalServices {
  constructor(private _owner: LessonControllerImpl) {}

  async connectTerminal(
    terminalConnectionInfo: TerminalConnectionInfo,
  ): Promise<TerminalConnectionResult> {
    if (!terminalConnectionInfo.username) {
      throw new Error('Must specify a user-name to connect');
    }

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
  private _avatar: TerminalAvatar;

  constructor(
    private _parent: LessonControllerImpl,
    private _id: string,
    connectionInfo: TerminalConnectionInfo,
  ) {
    this._lastHeartbeat = Date.now();
    this._transport = new TerminalZipcClientTransport(this);
    this._username = connectionInfo.username;
    this._avatar = connectionInfo.avatar;
    EndpointMultiplexingZipcTransport.registerEndpoint(
      this._id,
      this._transport,
    );
  }

  async heartbeat(
    messageCursor: number,
    timeoutMs: number,
  ): Promise<TerminalMessage[] | null> {
    this._lastHeartbeat = Date.now();
    Logger.debug(
      `Terminal ${this._id} heartbeat at ${this._lastHeartbeat}`,
      'terminal.heartbeat',
    );

    this._pendingMessages.dequeueUntil(messageCursor);
    return (await this._pendingMessages.peekAll(timeoutMs)) || [];
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get avatar(): TerminalAvatar {
    return this._avatar;
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
    this._terminal.postMessage({
      messageSeq: 0,
      type: 'zipc-dispatch',
      zipcMessage: request,
    });
    return '{"success": null}';
  }
}

type MessageWithSeq = {
  messageSeq: number;
};

class AsyncQueue<MessageType extends MessageWithSeq> {
  private _pendingMessages: MessageType[] = [];

  private _nextSeq = 0;
  private _queueReady: Promise<void> | null = null;
  private _queueReadySignal: () => void | null;

  dequeueUntil(cursor: number): MessageType[] {
    let numToDequeue = 0;
    while (
      numToDequeue < this._pendingMessages.length &&
      this._pendingMessages[numToDequeue].messageSeq <= cursor
    ) {
      numToDequeue++;
    }

    if (numToDequeue) {
      return this._pendingMessages.splice(0, numToDequeue);
    } else {
      return null;
    }
  }

  async peekAll(timeout: number): Promise<MessageType[] | null> {
    await this._waitForMessages(timeout);
    if (!this._pendingMessages.length) {
      return null;
    }

    return this._pendingMessages;
  }

  async dequeueAll(timeout: number): Promise<MessageType[] | null> {
    await this._waitForMessages(timeout);
    if (!this._pendingMessages.length) {
      return null;
    }

    const ret = this._pendingMessages;
    this._pendingMessages = [];

    return ret;
  }

  private async _waitForMessages(timeout: number): Promise<void> {
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
            return;
          } else {
            throw e;
          }
        }
      }
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  postMessage(message: MessageType): void {
    this._pendingMessages.push(message);
    message.messageSeq = this._nextSeq++;

    if (this._queueReadySignal) {
      const sigFn = this._queueReadySignal;
      this._queueReady = null;
      this._queueReadySignal = null;

      sigFn();
    }
  }
}
