import { Terminal } from 'school-games-common';
import { LessonControllerImpl } from './LessonControllerImpl';

export abstract class GameState {
  constructor(private _lessonController: LessonControllerImpl) {}

  abstract getConsoleServices(): object;

  abstract getTerminalServices(terminalId: string, terminal: Terminal): object;
}
