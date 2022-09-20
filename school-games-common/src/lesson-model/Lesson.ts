import { UseMarshallerType } from "../zipc/core/Marshaller";
import { GameType } from "./games-registry";
import { Terminal, TerminalConnectionInfo } from "./Terminal";


export type LessonStatusTerminalInfo = {  
}

export type LessonStatus = {
  terminalInfo: LessonStatusTerminalInfo[];
}

export class GameStartResult {
  @UseMarshallerType('weakRef')
  gameController: object;
}
export interface LessonControllerInterface {
  getConnectionUrl(): Promise<string>;
  getConnectionQrCodeUrl(): Promise<string>;
  getTerminalServices(): Promise<LessonTerminalServices>;

  getLessonStatus(): Promise<LessonStatus>;

  startGame(gameType: GameType): Promise<GameStartResult>;
}

export class TerminalConnectionResult {
  @UseMarshallerType('weakRef')
  terminal: Terminal;
}

export interface LessonTerminalServices {
  connectTerminal(terminalConnectionInfo: TerminalConnectionInfo): Promise<TerminalConnectionResult>;
}
