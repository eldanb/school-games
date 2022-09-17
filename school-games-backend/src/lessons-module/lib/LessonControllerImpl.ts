import { ConfigService } from '@nestjs/config';
import {
  LessonControllerInterface,
  LessonStatus,
  LessonTerminalServices,
  LiveObjectMonikerResolver,
  Terminal,
  TerminalConnectionInfo,
  TerminalConnectionResult,
} from 'school-games-common';
import * as QRCode from 'qrcode';
import { Logger } from '@nestjs/common';

export class LessonControllerImpl implements LessonControllerInterface {
  private _terminalConnectionService: LessonTerminalServices;
  private _terminals: TerminalImpl[] = [];

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

  constructor(
    private _parent: LessonControllerImpl,
    connectionInfo: TerminalConnectionInfo,
  ) {
    this._lastHeartbeat = Date.now();
  }

  async heartbeat(): Promise<void> {
    this._lastHeartbeat = Date.now();
  }

  get lastHeartbeat(): number {
    return this._lastHeartbeat;
  }
}
