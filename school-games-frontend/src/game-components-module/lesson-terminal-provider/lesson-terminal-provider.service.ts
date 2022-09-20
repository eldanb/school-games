import { EventEmitter, Injectable } from "@angular/core";
import { LessonTerminalServices, Terminal, TerminalMessage } from "school-games-common";
import { GameType } from "school-games-common/dist/lesson-model/games-registry";
import { ZipcClientService } from "../zipc-client-service/zipc-client.service";


@Injectable()
export class LessonTerminalProviderService {
  private _asyncLoadedTerminal: Promise<Terminal>;
  private _heartbeatTimer: any;
  private _heartbeatInterval = 3000;

  private _currentGameType: GameType | null;
  private _currentGameServices: object | null;

  private _terminalMessageEvent: EventEmitter<TerminalMessage> = new EventEmitter();

  constructor(private _zipcClient: ZipcClientService) {
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

  initTerminal(lessonManagerMoniker: string) {
    this._asyncLoadedTerminal = this.initTerminalAsync(lessonManagerMoniker);
  }

  getTerminalInterface(): Promise<Terminal> {
    return this._asyncLoadedTerminal;
  }

  private async initTerminalAsync(lessonManagerMoniker: string): Promise<Terminal> {
    const terminalServices = await this._zipcClient.zipcClient.bindMoniker<LessonTerminalServices>(lessonManagerMoniker);
    const bindResult = await terminalServices.connectTerminal({});

    this._heartbeatTimer = setInterval(async () => {
      const terminalMessages = await bindResult.terminal.heartbeat();
      for(let index = 0; index < terminalMessages.length; index++) {
        await this._handleEvent(terminalMessages[index]);
      }
    }, this._heartbeatInterval)

    return bindResult.terminal;
  }

  private async _handleEvent(terminalMessage: TerminalMessage) {
    switch(terminalMessage.type) {
      case 'start-game':
        this._currentGameType = terminalMessage.gameType;
        this._currentGameServices =
          terminalMessage.gameStateMoniker &&
          this._zipcClient.zipcClient.bindMoniker(terminalMessage.gameStateMoniker) || null;
    }

    this._terminalMessageEvent.emit(terminalMessage);
  }


}
