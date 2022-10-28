import { Terminal } from 'school-games-common';
import { LessonControllerImpl } from './LessonControllerImpl';

export abstract class GameState {
  constructor(protected _lessonController: LessonControllerImpl) {}

  abstract getConsoleServices(): object;

  abstract getTerminalServices(terminalId: string, terminal: Terminal): object;

  abstract notifyDeletedTerminal(terminalId: string, terminal: Terminal): void;

  abstract notifyNewTerminal(terminalId: string, terminal: Terminal): void;
}
