import {
  PoppedWordGameboard,
  PoppedWordGameStatus,
  Terminal,
  WordPopConsoleInterface,
  WordPopQuestionDefinition,
  WordPopTerminalListenerRegistration,
  WordPopTerminalServices,
} from 'school-games-common';
import { GameState } from '../GamesState';

const jitterX = 100;
const jitterY = 100;
const gridSizeX = 4;
const baloonColors = [
  'red',
  'green',
  'blue',
  'magenta',
  'orange',
  'purple',
  'darkcyan',
];

export class WordPopGameState
  extends GameState
  implements WordPopConsoleInterface
{
  private _terminalServices: Record<string, WordPopTerminalServicesImpl> = {};

  private _currentQuestion: WordPopQuestionDefinition | null;
  private _endTime: number | null;

  getConsoleServices(): WordPopConsoleInterface {
    return this;
  }

  getTerminalServices(
    terminalId: string,
    terminal: Terminal,
  ): WordPopTerminalServices {
    if (!this._terminalServices[terminalId]) {
      this._terminalServices[terminalId] = new WordPopTerminalServicesImpl(
        this,
        terminalId,
      );
    }

    return this._terminalServices[terminalId];
  }

  async startQuestion(
    questionDefinition: WordPopQuestionDefinition,
    gameLengthInSeconds: number,
  ): Promise<PoppedWordGameboard> {
    this._currentQuestion = questionDefinition;
    this._endTime = gameLengthInSeconds
      ? new Date().getTime() + gameLengthInSeconds
      : null;

    const positions = [];
    for (let i = 0; i < gridSizeX * gridSizeX; i++) {
      positions.push(i);
    }

    const generatedBoard: PoppedWordGameboard = {
      question: this._currentQuestion.question,
      endTime: this._endTime,
      baloons: [],
    };

    this._currentQuestion.validWords
      .concat(this._currentQuestion.invalidWords)
      .forEach((word) => {
        const posIndex = Math.round(Math.random() * (positions.length - 1));
        const pos = positions[posIndex];
        positions.splice(posIndex, 1);

        const jx = ((Math.random() - 0.5) * jitterX) / 2;
        const jy = ((Math.random() - 0.5) * jitterY) / 2;

        const color =
          baloonColors[Math.round(Math.random() * (baloonColors.length - 1))];

        generatedBoard.baloons.push({
          word: word,
          status: 'normal',
          color: color,
          position: {
            x: (pos % gridSizeX) * jitterX + jx + jitterX / 2,
            y: Math.floor(pos / gridSizeX) * jitterY + jy + jitterY / 2,
            zz: `pos ${pos} jx ${jx} jy ${jy}`,
          },
        });
      });

    await Promise.all(
      Object.values(this._terminalServices).map((ts) =>
        ts.startBoard(generatedBoard),
      ),
    );

    return generatedBoard;
  }

  isValidWord(word: string) {
    return this._currentQuestion.validWords.indexOf(word) >= 0;
  }

  async getGameStatus(): Promise<PoppedWordGameStatus> {
    const ret: PoppedWordGameStatus = {
      endTime: this._endTime,
      terminalStatus: {},
      gameState: !this._currentQuestion
        ? 'not-started'
        : Object.values(this._terminalServices).find((ts) => !ts.isCompleted())
        ? 'playing'
        : 'all-done',
    };

    Object.entries(this._terminalServices).forEach(([k, v]) => {
      ret.terminalStatus[k] = {
        totalWords: v.totalWords,
        goodPops: v.goodPops,
        badPops: v.badPops,
        playerCompleted: v.isCompleted(),
      };
    });

    return ret;
  }
}

class WordPopTerminalServicesImpl implements WordPopTerminalServices {
  private _listener: WordPopTerminalListenerRegistration | null = null;
  private _gameboard: PoppedWordGameboard | null = null;
  private _completed: boolean;

  private _goodPops = 0;
  private _badPops = 0;

  constructor(private _gs: WordPopGameState, private _terminalId: string) {}

  async popWord(wordToPop: string): Promise<boolean> {
    const poppedWordValid = this._gs.isValidWord(wordToPop);
    const updatedBaloon = this._gameboard.baloons.find(
      (b) => b.word === wordToPop,
    );

    if (updatedBaloon) {
      if (poppedWordValid) {
        updatedBaloon.status = 'wrong';
        this._badPops++;
      } else {
        updatedBaloon.status = 'popped';
        this._goodPops++;
      }
    }

    if (this._listener) {
      this._listener.listener.updateGameboard(this._gameboard);
    }

    return poppedWordValid;
  }

  async setWordPopListener(
    wordPopListener: WordPopTerminalListenerRegistration,
  ): Promise<void> {
    this._listener = wordPopListener;
  }

  async startBoard(gb: PoppedWordGameboard) {
    this._gameboard = JSON.parse(JSON.stringify(gb));
    this._completed = false;

    if (this._listener) {
      await this._listener.listener.updateGameboard(this._gameboard);
    }
  }

  async setCompleted() {
    this._completed = true;
  }

  isCompleted() {
    return this._completed;
  }

  get totalWords(): number {
    return this._gameboard?.baloons.length;
  }

  get goodPops(): number {
    return this._goodPops;
  }

  get badPops(): number {
    return this._badPops;
  }
}
