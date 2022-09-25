export interface ZipClientTransport {
  transact(moniker: string, request: string): Promise<string>;
}