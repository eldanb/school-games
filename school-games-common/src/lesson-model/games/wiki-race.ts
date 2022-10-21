import { UseMarshallerType } from "../../zipc/core/Marshaller";

export type WikiRaceTerminalPath = {
  term: string;
  time: number;
  weight: number;
}[];

export type WikiRaceTerminalStatus = {
  termHistory: WikiRaceTerminalPath;
  currentScore: number;  
}

export type WikiRaceRound = {
  startTerm: string;
  endTerm: string;
}

export type WikiRaceGameStatus = {
  currentRound: WikiRaceRound;
  roundStartTime: number;
  roundEndTime: number;

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