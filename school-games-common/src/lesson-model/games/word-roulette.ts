export type RouletteWheelState = {
  wheelDisplayName: string;
  wheelWord: string | null;
}

export interface WordRouletteConsoleInterface {
  setRouletteResults(reults: RouletteWheelState[]): Promise<void>;
}


export interface WordRouletteTerminalInterface {
  getRouletteResults(): Promise<RouletteWheelState[]>; 
}