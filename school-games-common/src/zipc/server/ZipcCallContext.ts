import { ZipcClient } from "../client/ZipcClient";

type CallContextAttributes = {
  [name: string]: any
};

export class ZipcCallContext {
  constructor(
    private _transport: string, 
    private _callerAttributes: CallContextAttributes = {},
    private _peerClient: ZipcClient | null = null
    ) {
  }

  getCallerAttribute(attributeName: string): any {
    return this._callerAttributes[attributeName];
  }

  get transport(): string {
    return this._transport;
  }

  get peerClient(): ZipcClient | null {
    return this._peerClient;
  }
}