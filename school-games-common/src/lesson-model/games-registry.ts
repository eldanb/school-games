export type GamesRegistry = {
  'word-roulette': {
    
  },
  'word-pop': {
    
  },
  'wiki-race': {
    
  }
}


export type GameType = keyof GamesRegistry;

export type ControllerGameStateInterface<T extends GameType> = GamesRegistry[T] extends {'gameStateController': infer Z} ? Z : never;
export type TerminalGameStateInterface<T extends GameType> = GamesRegistry[T] extends {'terminalGameState': infer Z} ? Z : never; 
