
export type WordRouletteWheelDefinition = {
  wheelTitle: string;
  wheelWordlist: string[];
}

export type WordRouletteGameDefinition = {
  wheelDefinitions: WordRouletteWheelDefinition[];
}
