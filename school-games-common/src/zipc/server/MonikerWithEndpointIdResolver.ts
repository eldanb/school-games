import { MonikerResolver, MonikerResolverTypeName } from "./MonikerResolver";

const MONIKER_PARSE_RE = /^epmk:([^/]+)\/(.*)$/;

@MonikerResolverTypeName('epmk')
export class MonikerWithEndpointResolver extends MonikerResolver {
  async resolve(moniker: string): Promise<object> {
    const [endpoint, underlyingMoniker] = MonikerWithEndpointResolver.getMonikerEndpointAndUnderlying(moniker);
    return await MonikerResolver.resolveMoniker(underlyingMoniker);
  }

  static setLocalEndpointId(localEndpointId: string) {
    this._localEndpointId = localEndpointId;
  }
  
  static addEndpointToMoniker(moniker: string) {
    return `epmk:${this._localEndpointId}/${moniker}`;
  }

  static getMonikerEndpointAndUnderlying(moniker: string) {
    const parsed = MONIKER_PARSE_RE.exec(moniker);
    if(!parsed) {
      throw new Error(`Invalid endpoint-moniker: ${moniker}`);
    }

    const [_, endpoint, underlyingMoniker] = parsed;
    return [endpoint, underlyingMoniker];
  }

  static _localEndpointId: string;  
}

