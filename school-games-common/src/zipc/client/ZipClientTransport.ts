export interface ZipClientTransport {
  transact(request: string): Promise<string>;
}