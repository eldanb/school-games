export interface TerminalConnectionInfo {

}

export interface Terminal {
  heartbeat(): Promise<void>;
}