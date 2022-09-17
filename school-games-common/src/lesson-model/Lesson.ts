import { UseMarshallerType } from "../zipc/core/Marshaller";
import { Terminal, TerminalConnectionInfo } from "./Terminal";


export type LessonStatusTerminalInfo = {  
}

export type LessonStatus = {
  terminalInfo: LessonStatusTerminalInfo[];
}


export interface LessonControllerInterface {
  getConnectionUrl(): Promise<string>;
  getConnectionQrCodeUrl(): Promise<string>;
  getTerminalServices(): Promise<LessonTerminalServices>;

  getLessonStatus(): Promise<LessonStatus>;
}

export class TerminalConnectionResult {
  @UseMarshallerType('weakRef')
  terminal: Terminal;
}

export interface LessonTerminalServices {
  connectTerminal(terminalConnectionInfo: TerminalConnectionInfo): Promise<TerminalConnectionResult>;
}
