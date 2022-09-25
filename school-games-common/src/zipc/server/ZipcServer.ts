import { Marshaller, MarshallingContext } from "../core/Marshaller";
import { ZipcRequest, ZipcResponse } from "../core/protocol";
import { MonikerResolver } from "./MonikerResolver";
import { ZipcCallContext } from "./ZipcCallContext";

export class ZipcServer {
  private _mc = new MarshallingContext();

  async handleRequest(request: string, callContext: ZipcCallContext): Promise<string> {
    let ret: ZipcResponse;

    try {
      const requestJson = JSON.parse(request) as ZipcRequest;    
      const requestData = requestJson.data;
    
      const resolvedObject = await MonikerResolver.resolveMoniker(requestData.moniker);
      
      const service: Function = resolvedObject[requestData.service];
      if(!service) {
        throw new Error(`Object with moniker ${requestData.moniker} ` +
                      `does not support service ${requestData.service}. ` + 
                      `Supported services: ${Object.keys(resolvedObject).join(', ')}`);
      }

      this._mc.client = callContext.peerClient;
      const unmarshalledArgs = requestData.args.map(arg => Marshaller.unmarshal(arg, this._mc));
      const result = await service.apply(resolvedObject, unmarshalledArgs);
      const marshalledResults = Marshaller.marshal(result, this._mc);

      ret = {
        success: marshalledResults ?? null
      };
    } catch(e) {
      ret = {
        error: {
          message: e.toString(),
          stackTrace: (e as Error).stack
        },        
      };
    }

    return JSON.stringify(ret);
  }
}