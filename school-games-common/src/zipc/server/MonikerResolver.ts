const MONIKER_PARSE_RE = /^([a-zA-Z_-]+):(.*)$/;
export abstract class MonikerResolver {
  abstract resolve(moniker: string): Promise<object | null>;


  static resolveMoniker(moniker: string): Promise<object | null> {
    const monikerTypeString = MONIKER_PARSE_RE.exec(moniker)[1];
    
    const resolver = MONIKER_RESOLVER_BY_MONIKER_TYPE[monikerTypeString];
    if(!resolver) {
      throw new Error(`Invalid moniker type ${monikerTypeString}`);      
    }

    return resolver.resolve(moniker);
  }

  static resgisterResolver(typeName: string, resolver: MonikerResolver) {
    MONIKER_RESOLVER_BY_MONIKER_TYPE[typeName] = resolver;
  }
}

const MONIKER_RESOLVER_BY_MONIKER_TYPE: {
  [typeName: string]: MonikerResolver;
} = {

}

export function MonikerResolverTypeName(typeName: string) {
  return function(cls) {
    MonikerResolver.resgisterResolver(typeName, new cls());
    return cls;
  }
}