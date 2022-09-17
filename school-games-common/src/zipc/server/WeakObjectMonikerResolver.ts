import { MonikerResolver, MonikerResolverTypeName } from "./MonikerResolver";
import * as uuid from 'uuid';
import { WeakValueMap } from "../core/WeakValueMap";

@MonikerResolverTypeName('wuuid')
export class WeakObjectMonikerResolver extends MonikerResolver {
  resolve(moniker: string): Promise<object> {
    const resolved = WeakObjectMonikerResolver._registeredWeakObjectsByMoniker.get(moniker);
    return resolved != null
      ? Promise.resolve(resolved)
      : Promise.reject(new Error("Object not found"));
  }

  static registerObject(registeredObject: object): string {
    const currentMoniker = WeakObjectMonikerResolver._objectToMoniker.get(registeredObject);
    if(currentMoniker) {
      return currentMoniker;
    } else {
      const newId = `wuuid:${uuid.v4()}`;
      WeakObjectMonikerResolver._registeredWeakObjectsByMoniker.put(newId, registeredObject);
      WeakObjectMonikerResolver._objectToMoniker.set(registeredObject, newId);
      return newId;
    }
  }

  static unregisterObject(moniker: string) {
    const currentObj = this._registeredWeakObjectsByMoniker.get(moniker);
    if(currentObj) {
      this._registeredWeakObjectsByMoniker.remove(moniker);
      this._objectToMoniker.delete(currentObj);
    }    
  }

  static _registeredWeakObjectsByMoniker: WeakValueMap<string, any> = new WeakValueMap();
  static _objectToMoniker: WeakMap<any, string> = new WeakMap();
}

