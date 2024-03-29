import { UseMarshallerType } from "../../zipc/core/Marshaller";
import { TerminalAvatar } from "../Terminal";

export type WordPopQuestionDefinition = {
  question: string;
  validWords: string[];
  invalidWords: string[];
}

export type PoppedWordTerminalStatus = {
  avatar: TerminalAvatar;
  username: string;
  totalWords: number;
  goodPops: number;
  badPops: number;
  playerCompleted: boolean;
}

export type PoppedWordGameStatus = {
  gameState: "not-started" | "playing" | "all-done";

  endTime: number | null;
  terminalStatus: { [terminalId: string]: PoppedWordTerminalStatus };
}

export interface WordPopConsoleInterface {
  startQuestion(questionDefinition: WordPopQuestionDefinition, gameLengthInSeconds: number | null): Promise<PoppedWordGameboard>;
  getGameStatus(): Promise<PoppedWordGameStatus>;
}

export class WordPopTerminalListenerRegistration {
  @UseMarshallerType('weakRefWithEndpoint')
  listener: WordPopTerminalListener;
}

export interface WordPopTerminalServices {
  popWord(wordToPop: string): Promise<boolean>;
  setWordPopListener(wordPopListener: WordPopTerminalListenerRegistration): Promise<void>;
  setCompleted(): Promise<void>;
}

export type PoppedWordGameboard = {
  question: string;
  endTime: number | null; 
  baloons: {
    word: string;
    status: "normal" | "popped" | "wrong";
    color: string;
    position: {
      x: number;
      y: number;
      zz: string;
    };    
  }[];
}

export interface WordPopTerminalListener {
  updateGameboard(gameboard: PoppedWordGameboard): Promise<void>;
  setPrompt(prompt: string): Promise<void>;
}