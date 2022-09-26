import { EventEmitter, Injectable } from "@angular/core";
import { LessonTerminalServices, MonikerWithEndpointResolver, Terminal, TerminalMessage, ZipcServer } from "school-games-common";
import { GameType } from "school-games-common/dist/lesson-model/games-registry";
import { ZipcCallContext } from "school-games-common/dist/zipc/server/ZipcCallContext";
import { ZipcClientService } from "../zipc-client-service/zipc-client.service";

const zipcServer = new ZipcServer();
@Injectable()
export class LessonTerminalProviderService {
  private _asyncLoadedTerminal: Promise<Terminal>;

  private _keepPolling: boolean = true;

  private _currentGameType: GameType | null;
  private _currentGameServices: object | null;

  private _terminalMessageEvent: EventEmitter<TerminalMessage> = new EventEmitter();

  constructor(private _zipcClientService: ZipcClientService) {
  }

  get onTerminalMessage() {
    return this._terminalMessageEvent;
  }

  get currentGameType(): GameType | null {
    return this._currentGameType;
  }

  get currentGameServices(): object | null {
    return this._currentGameServices;
  }

  initTerminal(lessonManagerMoniker: string, username: string) {
    this._asyncLoadedTerminal = this.initTerminalAsync(lessonManagerMoniker, username);
  }

  getTerminalInterface(): Promise<Terminal> {
    return this._asyncLoadedTerminal;
  }

  private async initTerminalAsync(lessonManagerMoniker: string, username: string): Promise<Terminal> {
    const terminalServices = await this._zipcClientService.zipcClient.bindMoniker<LessonTerminalServices>(lessonManagerMoniker);
    const bindResult = await terminalServices.connectTerminal({username});

    (async () => {
      while(this._keepPolling) {
        const terminalMessages = await bindResult.terminal.heartbeat();
        for(let index = 0; index < terminalMessages.length; index++) {
          await this._handleEvent(terminalMessages[index]);
        }
      }
    })();

    MonikerWithEndpointResolver.setLocalEndpointId(bindResult.terminalId);

    return bindResult.terminal;
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
