import { UseMarshallerType } from "../../zipc/core/Marshaller";

export type RouletteWheelState = {
  wheelDisplayName: string;
  wheelWord: string | null;
}

export interface WordRouletteConsoleInterface {
  setRouletteResults(reults: RouletteWheelState[]): Promise<void>;
}

export interface WordRouletteTerminalGameListener {
  notifyRollResults(results: RouletteWheelState[]): Promise<void>;
}

export class GameListenerRegistration {
  @UseMarshallerType('weakRefWithEndpoint')
  listener: WordRouletteTerminalGameListener;
}
export interface WordRouletteTerminalInterface {
  registerTerminalGameListener(gameListenerRegistration: GameListenerRegistration): Promise<void>;
}