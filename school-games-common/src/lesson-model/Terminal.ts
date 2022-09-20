import { GameType } from "./games-registry";

export interface TerminalConnectionInfo {

}

type TerminalMessagesMap = {
  'chat-notification': {
    from: string;
    text: string;
  },

  'start-game': {
    gameType: GameType;
    gameStateMoniker?: string;
  }
}

type SelfDescribingKeysHelper<T extends keyof E, E> = T extends keyof E ? ({ type: T } & E[T]) : never;
type SelfDescribingMessage<E> = SelfDescribingKeysHelper<keyof E, E>;

export type TerminalMessage = SelfDescribingMessage<TerminalMessagesMap>;

export interface Terminal {
  heartbeat(): Promise<TerminalMessage[]>;
}