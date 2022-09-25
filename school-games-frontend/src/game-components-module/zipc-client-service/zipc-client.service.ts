import { Injectable } from "@angular/core";
import { ZipcClient, ZipClientTransport } from "school-games-common";
import { BackendHttpClient } from "../backend-client/backend-http-client";

@Injectable()
export class ZipcClientService implements ZipClientTransport {
  private _zipcClient: ZipcClient;

  constructor(private _backendClient: BackendHttpClient) {
    this._zipcClient = new ZipcClient(this);
  }

  transact(moniker: string, request: string): Promise<string> {
    return this._backendClient.zipcTransact(request);
  }

  get zipcClient(): ZipcClient {
    return this._zipcClient;
  }
}
