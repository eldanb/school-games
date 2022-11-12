import { UseMarshallerType } from "../../zipc/core/Marshaller";
import { TerminalAvatar } from "../Terminal";

export type WikiRaceRoundStatus = 'pre' | 'running' | 'winners' | 'no-winners';

export type WikiRoundType = 'shortest-path' | 'best-time';

export type WikiRaceTerminalPath = {
  term: string;
  time: number;
  weight: number;
}[];

export type WikiRaceTerminalStatus = {
  avatar: TerminalAvatar;

  username: string;
  termHistory: WikiRaceTerminalPath;

  currentScore: number;
  reachedEndTerm: number | null;
}

export type WikiRaceRound = {
  startTerm: string;
  endTerm: string;
  roundType: WikiRoundType;
}

export type WikiRaceGameStatus = {
  currentRound: WikiRaceRound;
  
  roundStartTime: number;
  roundEndTime: number;
  roundStatus: WikiRaceRoundStatus;

  terminalStatus: {
    [terminalId: string]: WikiRaceTerminalStatus;
  }
}

export class WikiRaceTerminalListenerRegistration {
  @UseMarshallerType('weakRefWithEndpoint')
  listener: WikiRaceTerminalListener;
}

export interface WikiRaceConsoleServices {
  getGameStatus(): Promise<WikiRaceGameStatus>;
  startRound(round: WikiRaceRound, startTime: number, endTime: number): Promise<void>;

  generateRound(numSteps: number): Promise<WikiRaceRound>;  
  isTerm(term: string): Promise<boolean>;
}

export interface WikiRaceTerminalServices {
  setListener(listener: WikiRaceTerminalListenerRegistration): Promise<void>;
  notifyVisitToTerm(term: string): Promise<WikiRaceTerminalPath>;
  notifyBacktrack(toNavStep: number): Promise<WikiRaceTerminalPath>;
}

export interface WikiRaceTerminalListener {
  startRound(round: WikiRaceRound, startTime: number, endTime: number): Promise<void>;
  endRound(): Promise<void>;
}