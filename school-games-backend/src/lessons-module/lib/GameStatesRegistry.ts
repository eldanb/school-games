import { GameType } from 'school-games-common/dist/lesson-model/games-registry';
import { LessonControllerImpl } from './LessonControllerImpl';
import { GameState } from './GamesState';
import { EmptyGameState } from './EmptyGameState';
import { Logger } from '@nestjs/common';
import { inspect } from 'util';

type GameStateConstructor = new (
  lessonController: LessonControllerImpl,
) => GameState;

export const GameStatesRegistry: {
  [gameType in GameType]: GameStateConstructor;
} = {
  'word-roulette': EmptyGameState,
};

export function createLessonState(
  gameType: GameType,
  owner: LessonControllerImpl,
): GameState {
  Logger.debug(
    `GSR ${inspect(GameStatesRegistry)} ${
      GameStatesRegistry[gameType]
    } for ${gameType}`,
  );
  return new GameStatesRegistry[gameType](owner);
}
