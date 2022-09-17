import { Injectable } from "@angular/core";
import { LessonTerminalServices, Terminal } from "school-games-common";
import { ZipcClientService } from "../zipc-client-service/zipc-client.service";


@Injectable()
export class LessonTerminalProviderService {
  private _asyncLoadedTerminal: Promise<Terminal>;
  private _heartbeatTimer: any;
  private _heartbeatInterval = 3000;

  constructor(private _zipcClient: ZipcClientService) {
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

    this._heartbeatTimer = setInterval(() => {
      bindResult.terminal.heartbeat();
    }, this._heartbeatInterval)

    return bindResult.terminal;
  }
}
