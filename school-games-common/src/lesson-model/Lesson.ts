import { UseMarshallerType } from "../zipc/core/Marshaller";
import { SelfDescribingMessage } from "../zipc/core/SelfDescribingMessage";
import { GameType } from "./games-registry";
import { Terminal, TerminalAvatar, TerminalConnectionInfo } from "./Terminal";

export type LessonStatusTerminalInfo = {  
  terminalId: string;
  username: string;
  avatar: TerminalAvatar;
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
  SelfDescribingMessage<LessonControllerMessageMap> & { messageSeq: number };

export interface LessonControllerInterface {
  getConnectionUrl(): Promise<string>;
  getConnectionQrCodeUrl(): Promise<string>;
  getTerminalServices(): Promise<LessonTerminalServices>;

  getLessonStatus(): Promise<LessonStatus>;

  startGame(gameType: GameType): Promise<GameStartResult>;
  sendMessage(terminalId: string, message: string): Promise<void>;

  hearbeat(messageCursor: number, timeoutMs: number): Promise<LessonControllerMessage[]>;
}

export class TerminalConnectionResult {
  terminalId: string;

  @UseMarshallerType('weakRefWithEndpoint')
  terminal: Terminal;
}

export interface LessonTerminalServices {
  connectTerminal(terminalConnectionInfo: TerminalConnectionInfo): Promise<TerminalConnectionResult>;
}
