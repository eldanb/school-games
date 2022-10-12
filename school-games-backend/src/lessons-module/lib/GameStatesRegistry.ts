import { GameType } from 'school-games-common/dist/lesson-model/games-registry';
import { LessonControllerImpl } from './LessonControllerImpl';
import { Logger } from '@nestjs/common';
import { inspect } from 'util';
import { RouletteGameState } from './game-states/RouletteGameState';
import { GameState } from './GamesState';
import { WordPopGameState } from './game-states/WordPopGameState';

type GameStateConstructor = new (
  lessonController: LessonControllerImpl,
) => GameState;

export const GameStatesRegistry: {
  [gameType in GameType]: GameStateConstructor;
} = {
  'word-roulette': RouletteGameState,
  'word-pop': WordPopGameState,
};

export function createLessonState(
  gameType: GameType,
  owner: LessonControllerImpl,
): GameState {
  return new GameStatesRegistry[gameType](owner);
}
