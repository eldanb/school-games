import {
  PoppedWord,
  PoppedWordGameboard,
  PoppedWordGameStatus,
  Terminal,
  WordPopConsoleInterface,
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
  private _commonPoppedWords: PoppedWord[];
  private _endTime: number | null;
  private _question: string;

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

  async startGame(
    question: string,
    commonPoppedWords: PoppedWord[],
    gameLengthInSeconds: number | null,
  ): Promise<void> {
    this._commonPoppedWords = commonPoppedWords;
    this._endTime = gameLengthInSeconds
      ? new Date().getTime() + gameLengthInSeconds
      : null;
    this._question = question;

    const positions = [];
    for (let i = 0; i < gridSizeX * gridSizeX; i++) {
      positions.push(i);
    }

    const generatedBoard: PoppedWordGameboard = {
      question: this._question,
      endTime: this._endTime,
      baloons: [],
    };

    commonPoppedWords.forEach((poppedWord) => {
      const posIndex = Math.round(Math.random() * (positions.length - 1));
      const pos = positions[posIndex];
      positions.splice(posIndex, 1);

      const jx = ((Math.random() - 0.5) * jitterX) / 2;
      const jy = ((Math.random() - 0.5) * jitterY) / 2;

      const color =
        baloonColors[Math.round(Math.random() * (baloonColors.length - 1))];

      generatedBoard.baloons.push({
        word: poppedWord.word,
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
  }

  isValidWord(wordToPop: string) {
    return (
      this._commonPoppedWords.find((w) => w.word === wordToPop)?.valid ?? false
    );
  }

  async getGameStatus(): Promise<PoppedWordGameStatus> {
    const ret: PoppedWordGameStatus = {
      endTime: this._endTime,
      terminalStatus: {},
    };

    Object.entries(this._terminalServices).forEach(([k, v]) => {
      ret.terminalStatus[k] = {
        totalWords: v.totalWords,
        goodPops: v.goodPops,
        badPops: v.badPops,
      };
    });

    return ret;
  }
}

class WordPopTerminalServicesImpl implements WordPopTerminalServices {
  private _listener: WordPopTerminalListenerRegistration | null = null;
  private _gameboard: PoppedWordGameboard | null = null;

  constructor(private _gs: WordPopGameState, private _terminalId: string) {}

  async popWord(wordToPop: string): Promise<boolean> {
    const ret = this._gs.isValidWord(wordToPop);
    const updatedBaloon = this._gameboard.baloons.find(
      (b) => b.word === wordToPop,
    );
    if (updatedBaloon) {
      updatedBaloon.status = ret ? 'popped' : 'wrong';
    }

    if (this._listener) {
      this._listener.listener.updateGameboard(this._gameboard);
    }

    return ret;
  }

  async setWordPopListener(
    wordPopListener: WordPopTerminalListenerRegistration,
  ): Promise<void> {
    this._listener = wordPopListener;
  }

  async startBoard(gb: PoppedWordGameboard) {
    this._gameboard = JSON.parse(JSON.stringify(gb));

    if (this._listener) {
      await this._listener.listener.updateGameboard(this._gameboard);
    }
  }

  get totalWords(): number {
    return this._gameboard?.baloons.length;
  }
  get goodPops(): number {
    return this._gameboard?.baloons.filter((b) => b.status === 'popped').length;
  }
  get badPops(): number {
    return this._gameboard?.baloons.filter((b) => b.status === 'wrong').length;
  }
}
