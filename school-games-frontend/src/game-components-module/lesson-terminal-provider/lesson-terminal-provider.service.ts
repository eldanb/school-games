import { EventEmitter, Injectable, OnDestroy } from "@angular/core";
import { firstValueFrom, Subject, timer } from "rxjs";
import { LessonTerminalServices, MonikerWithEndpointResolver, Terminal, TerminalAvatar, TerminalMessage, ZipcServer } from "school-games-common";
import { GameType } from "school-games-common/dist/lesson-model/games-registry";
import { ZipcCallContext } from "school-games-common/dist/zipc/server/ZipcCallContext";
import { ZipcClientService } from "../zipc-client-service/zipc-client.service";

const zipcServer = new ZipcServer();

export type TerminalConnectionState = "online" | "trouble" | "nc";

@Injectable()
export class LessonTerminalProviderService implements OnDestroy {
  private _asyncLoadedTerminal: Promise<Terminal>;

  private _keepPolling: boolean = true;

  private _currentGameType: GameType | null;
  private _currentGameServices: object | null;
  private _lastMessageSeq: number = -1;

  private _heartbeatTimeout: number = 3000;
  private _heartbeatWatchdogTimer: any = null;
  private _lastHearbeatTime: number;

  private _terminalMessageEvent: EventEmitter<TerminalMessage> = new EventEmitter();

  private _connectionState: TerminalConnectionState;
  private _onConnectionStateChange: EventEmitter<TerminalConnectionState> = new EventEmitter();

  constructor(private _zipcClientService: ZipcClientService) {
  }

  ngOnDestroy(): void {
    if(this._heartbeatWatchdogTimer) {
      clearInterval(this._heartbeatWatchdogTimer);
      this._heartbeatWatchdogTimer = null;
    }
  }

  get onConnectionStateChange(): EventEmitter<TerminalConnectionState> {
    return this._onConnectionStateChange;
  }

  get onTerminalMessage() {
    return this._terminalMessageEvent;
  }

  get connectionState(): TerminalConnectionState {
    return this._connectionState;
  }

  get currentGameType(): GameType | null {
    return this._currentGameType;
  }

  get currentGameServices(): object | null {
    return this._currentGameServices;
  }

  initTerminal(lessonManagerMoniker: string, username: string, avatar: TerminalAvatar) {
    this._asyncLoadedTerminal = this.initTerminalAsync(lessonManagerMoniker, username, avatar);
    return this._asyncLoadedTerminal;
  }

  getTerminalInterface(): Promise<Terminal> {
    return this._asyncLoadedTerminal;
  }

  private async initTerminalAsync(lessonManagerMoniker: string, username: string, avatar: TerminalAvatar): Promise<Terminal> {
    const terminalServices = await this._zipcClientService.zipcClient.bindMoniker<LessonTerminalServices>(lessonManagerMoniker);
    const bindResult = await terminalServices.connectTerminal({username, avatar});

    this._connectionState = 'online';
    this._onConnectionStateChange.emit(this._connectionState);

    (async () => {
      while(this._keepPolling) {
        try {
          const terminalMessages = await bindResult.terminal.heartbeat(this._lastMessageSeq, this._heartbeatTimeout);

          this._lastHearbeatTime = Date.now();

          if(this._connectionState !== 'online') {
            this._connectionState = 'online';
            this._onConnectionStateChange.emit(this._connectionState);
          }

          for(let index = 0; index < terminalMessages.length; index++) {
            await this._handleEvent(terminalMessages[index]);
            this._lastMessageSeq = terminalMessages[index].messageSeq;
          }
        } catch(e) {
          console.error("Error on heartbeat");
          console.error(e);
          await firstValueFrom(timer(this._heartbeatTimeout));
        }
      }
    })();

    MonikerWithEndpointResolver.setLocalEndpointId(bindResult.terminalId);

    this._heartbeatWatchdogTimer = setInterval(() => this._heartbeatWatchdog(), this._heartbeatTimeout / 2);

    return bindResult.terminal;
  }

  private _heartbeatWatchdog() {
    const timeoutThreshold = Date.now() - this._heartbeatTimeout * 2;
    if(this._connectionState === 'online' &&
      this._lastHearbeatTime <= timeoutThreshold) {
      this._connectionState = 'trouble';
      this._onConnectionStateChange.emit(this._connectionState);
    } else
    if(this._connectionState !== 'online' &&
      this._lastHearbeatTime >= timeoutThreshold) {
      this._connectionState = 'online';
      this._onConnectionStateChange.emit(this._connectionState);
    }
  }

  private async _handleEvent(terminalMessage: TerminalMessage) {
    switch(terminalMessage.type) {
      case 'zipc-dispatch':
        zipcServer.handleRequest(terminalMessage.zipcMessage, new ZipcCallContext('terminal', {}, this._zipcClientService.zipcClient));
        break;

      case 'start-game':
        this._currentGameType = terminalMessage.gameType;
        this._currentGameServices =
          terminalMessage.gameStateMoniker &&
          this._zipcClientService.zipcClient.bindMoniker(terminalMessage.gameStateMoniker) || null;
        break;
    }

    this._terminalMessageEvent.emit(terminalMessage);
  }
}
