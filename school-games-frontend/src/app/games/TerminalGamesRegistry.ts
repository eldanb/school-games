import { GameType } from "school-games-common/dist/lesson-model/games-registry";
import { EmptyTerminalGamePageComponent } from "./empty-terminal-game-page/empty-terminal-game-page.component";

type TerminalGameInfo = {
  rootComponent: any;
  gameTitle: string;
}

export const TerminalGamesRegistry: {
  [gameType in GameType]: TerminalGameInfo
} = {
  "word-roulette": {
    rootComponent: EmptyTerminalGamePageComponent,
    gameTitle: "רולטת מילים"
  }
}
