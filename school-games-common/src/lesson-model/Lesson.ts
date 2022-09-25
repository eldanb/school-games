import { UseMarshallerType } from "../zipc/core/Marshaller";
import { SelfDescribingMessage } from "../zipc/core/SelfDescribingMessage";
import { GameType } from "./games-registry";
import { Terminal, TerminalConnectionInfo } from "./Terminal";


export type LessonStatusTerminalInfo = {  
}

export type LessonStatus = {
  terminalInfo: LessonStatusTerminalInfo[];
}

export class GameStartResult {
  @UseMarshallerType('weakRefWithEndpoint')
  gameController: object;
}


type LessonControllerMessageMap = {
  'zipc-message': {
    moniker: string;
    args: any;
  };
};

export type LessonControllerMessage =
  SelfDescribingMessage<LessonControllerMessageMap>;

export interface LessonControllerInterface {
  getConnectionUrl(): Promise<string>;
  getConnectionQrCodeUrl(): Promise<string>;
  getTerminalServices(): Promise<LessonTerminalServices>;

  getLessonStatus(): Promise<LessonStatus>;

  startGame(gameType: GameType): Promise<GameStartResult>;

  hearbeat(): Promise<LessonControllerMessage[]>;
}

export class TerminalConnectionResult {
  terminalId: string;

  @UseMarshallerType('weakRefWithEndpoint')
  terminal: Terminal;
}

export interface LessonTerminalServices {
  connectTerminal(terminalConnectionInfo: TerminalConnectionInfo): Promise<TerminalConnectionResult>;
}
