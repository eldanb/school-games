import { GameType } from "school-games-common/dist/lesson-model/games-registry";
import { EmptyTerminalGamePageComponent } from "./empty-terminal-game-page/empty-terminal-game-page.component";
import { WordPopTerminalPageComponent } from "./word-pop/word-pop-terminal-page/word-pop-terminal-page.component";
import { WordRouletteTerminalPageComponent } from "./words-roulette/word-roulette-terminal-page/word-roulette-terminal-page.component";

type TerminalGameInfo = {
  rootComponent: any;
  gameTitle: string;
}

export const TerminalGamesRegistry: {
  [gameType in GameType]: TerminalGameInfo
} = {
  "word-roulette": {
    rootComponent: WordRouletteTerminalPageComponent,
    gameTitle: "רולטת מילים"
  },
  "word-pop": {
    rootComponent: WordPopTerminalPageComponent,
    gameTitle: "בלוני מילים"
  }
}
