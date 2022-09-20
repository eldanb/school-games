import { Terminal } from 'school-games-common';
import { GameType } from 'school-games-common/dist/lesson-model/games-registry';
import { LessonControllerImpl } from './LessonControllerImpl';
import { GameStatesRegistry } from './GameStatesRegistry';
import { Logger } from '@nestjs/common';
import { inspect } from 'util';

export abstract class GameState {
  constructor(private _lessonController: LessonControllerImpl) {}

  abstract getConsoleServices(): object;

  abstract getTerminalServices(terminal: Terminal): object;
}
