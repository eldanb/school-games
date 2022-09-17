import { MonikerResolver, MonikerResolverTypeName } from "./MonikerResolver";
import * as uuid from 'uuid';

@MonikerResolverTypeName('luuid')
export class LiveObjectMonikerResolver extends MonikerResolver {
  resolve(moniker: string): Promise<object> {
    const resolved = REGISTERED_LIVE_OBJECTS[moniker];
    return resolved != null
      ? Promise.resolve(resolved)
      : Promise.reject(new Error("Object not found"));
  }

  static registerObject(registeredObject: object): string {
    if((registeredObject as any).___lomMoniker) {
      return (registeredObject as any).___lomMoniker;
    } else
    {
      const newId = `luuid:${uuid.v4()}`;
      REGISTERED_LIVE_OBJECTS[newId] = registeredObject;
      (registeredObject as any).___lomMoniker = newId;
      return newId;
    }
  }

  static unregisterObject(moniker: string) {
    delete REGISTERED_LIVE_OBJECTS[moniker];
  }
}

const REGISTERED_LIVE_OBJECTS: {
  [moniker:string]: any 
} = {};