import { SelfDescribingMessage } from "../zipc/core/SelfDescribingMessage";
import { GameType } from "./games-registry";

export interface TerminalConnectionInfo {
  username: string;
}

type TerminalMessagesMap = {
  'chat-notification': {
    from: string;
    text: string;
  },

  'start-game': {
    gameType: GameType;
    gameStateMoniker?: string;
  },

  'zipc-dispatch': {
    zipcMessage: string;
  }
}

export type TerminalMessage = SelfDescribingMessage<TerminalMessagesMap>;

export interface Terminal {
  heartbeat(): Promise<TerminalMessage[]>;
}