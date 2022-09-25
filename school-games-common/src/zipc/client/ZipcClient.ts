import { Marshaller, MarshallingContext } from "../core/Marshaller";
import { ZipcRequest, ZipcResponse } from "../core/protocol";
import { WeakValueMap } from "../core/WeakValueMap";
import { ZipClientTransport } from "./ZipClientTransport";

export class ZipcClient {
  private _proxyMap: WeakValueMap<string, any> = new WeakValueMap<string, any>();
  private _mc: MarshallingContext;

  constructor(private _transport: ZipClientTransport) {
    this._mc = new MarshallingContext();
    this._mc.client = this;
  }
  

  bindMoniker<T>(moniker: string): T {
    let proxy = this._proxyMap.get(moniker);

    if(!proxy) {
      proxy = new Proxy({}, {
        get: (target, property, receiver) => {
          if(property == 'then') {
            return undefined;
          }

          if(!target[property]) {
            target[property] = this.generateLongProxyCall<T>(target, moniker, property.toString());
          }

          return target[property];
        }
      });

      this._proxyMap.put(moniker, proxy);      
    }

    return proxy;
  }


  generateLongProxyCall<T>(target: any, moniker: string, property: string) {
    return async (...args: any[]) => {
      const request: ZipcRequest = {
        data: {
          moniker,
          service: property,
          args: args.map(arg => Marshaller.marshal(arg, this._mc))
        }
      };
  
      const response = JSON.parse(await this._transport.transact(moniker, JSON.stringify(request))) as ZipcResponse;

      if('error' in response) {
        throw new Error(response.error.message);
      } else {
        return Marshaller.unmarshal(response.success, this._mc);
      }
    }
  } 
}