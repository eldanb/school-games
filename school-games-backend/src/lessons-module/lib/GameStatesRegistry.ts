import { GameType } from 'school-games-common/dist/lesson-model/games-registry';
import { RouletteGameState } from './game-states/RouletteGameState';
import { WikiRaceGameState } from './game-states/WikiRaceGameState';
import { WordPopGameState } from './game-states/WordPopGameState';
import { GameState } from './GamesState';
import { LessonControllerImpl } from './LessonControllerImpl';

type GameStateConstructor = new (
  lessonController: LessonControllerImpl,
) => GameState;

export const GameStatesRegistry: {
  [gameType in GameType]: GameStateConstructor;
} = {
  'word-roulette': RouletteGameState,
  'word-pop': WordPopGameState,
  'wiki-race': WikiRaceGameState,
};

export function createLessonState(
  gameType: GameType,
  owner: LessonControllerImpl,
): GameState {
  return new GameStatesRegistry[gameType](owner);
}
