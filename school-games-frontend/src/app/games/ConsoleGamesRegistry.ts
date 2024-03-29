import { GameType } from "school-games-common/dist/lesson-model/games-registry";
import { WikiRaceConsolePageComponent } from "./wiki-race/wiki-race-console-page/wiki-race-console-page.component";
import { WordPopConsolePageComponent } from "./word-pop/word-pop-console-page/word-pop-console-page.component";
import { WordRoulettePageComponent } from "./words-roulette/word-roulette-page/word-roulette-page.component";

type ConsoleGameInfo = {
  rootComponent: any;
  gameTitle: string;
}

export const ConsoleGamesRegistry: {
  [gameType in GameType]: ConsoleGameInfo
} = {
  "word-roulette": {
    rootComponent: WordRoulettePageComponent,
    gameTitle: "רולטת מילים"
  },
  "word-pop": {
    rootComponent: WordPopConsolePageComponent,
    gameTitle: "בלוני מילים"
  },
  "wiki-race": {
    rootComponent: WikiRaceConsolePageComponent,
    gameTitle: "ויקיפדיה"
  }
}
