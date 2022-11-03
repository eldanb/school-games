import { SelfDescribingMessage } from "../zipc/core/SelfDescribingMessage";
import { GameType } from "./games-registry";

export type TerminalAvatar = {
  avatarName: string;
  avatarColor: string;
}

export interface TerminalConnectionInfo {
  username: string;
  avatar: TerminalAvatar;
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

export type TerminalMessage = SelfDescribingMessage<TerminalMessagesMap> & { messageSeq: number };

export interface Terminal {
  heartbeat(messageCursor: number, timeoutMs: number): Promise<TerminalMessage[]>;
}
