import 'reflect-metadata';
import { ZipcClient } from '../client/ZipcClient';
import { WeakObjectMonikerResolver } from '../server/WeakObjectMonikerResolver';

// TODO separate marshallers from unmarshallers?

export class MarshallingContext {
  client?: ZipcClient;
}

export abstract class Marshaller {
  public abstract marshal(value: object, ctxt: MarshallingContext): object;
  public abstract unmarshal(value: object, ctxt: MarshallingContext): object;

  public static marshalWithMarshaller(value: any, marshaller: Marshaller, ctxt: MarshallingContext): any {
    const marshalled = marshaller.marshal(value, ctxt);
    marshalled['$m'] = (marshaller as any).__marshallerType;
    return marshalled;
  }

  public static marshal(value: any, ctxt: MarshallingContext): any {
    if(value === null) {
      return null;
    }

    switch(typeof(value)) {
      case 'number':
      case 'boolean':
      case 'string':
      case 'undefined':        
        return value;

      case 'object':
        if(value instanceof Array) {
          return value.map((v) => this.marshal(v, ctxt));
        } else {
          return this.marshalWithMarshaller(value, this.getMarshallerForValue(value), ctxt);
        }

      default:
        throw new Error(`Cannot marshal value ${value}`);
    }
  }

  public static unmarshal(value: any, ctxt: MarshallingContext): any {
    if(value === null) {
      return null;
    }

    switch(typeof(value)) {
      case 'number':
      case 'boolean':
      case 'string':        
        return value;

      case 'object':
        if(value instanceof Array) {
          return value.map((v) => this.unmarshal(v, ctxt));
        } else {
          return Marshaller.byType(value['$m']).unmarshal(value, ctxt);
        }

      default:
        throw new Error(`Cannot unmarshal value ${JSON.stringify(value)}`);
    }
  }

  public static getMarshallerForValue(marshalledValue: any): Marshaller {
    return this._marshallers['d'];
  }

  public static byType(marshallerType: string): Marshaller {
    const ret = this._marshallers[marshallerType];
    if(!ret) {
      throw new Error(`Invalid marshaller type ${marshallerType}`);
    }

    return ret;
  }

  public static _marshallers: { [marshallerType: string]: Marshaller } = {};
}

function MarshallerType(marshallerType: string) {
  return function(cls) {
    cls.prototype.__marshallerType = marshallerType;
    Marshaller._marshallers[marshallerType] = new cls();
  }
}

@MarshallerType('d')
export class DefaultMarshaller extends Marshaller {
  public marshal(value: object, ctxt: MarshallingContext): object {
    const ret = {};

    Object.entries(value).forEach(([k, v]) => {
      const propertyMarshaller = Reflect.getMetadata(DefaultMarshaller.ZipcMarshallerTypeMetadataKey, value, k);
      if(propertyMarshaller) {
          ret[k] = Marshaller.marshalWithMarshaller(v, Marshaller.byType(propertyMarshaller), ctxt);
      } else {
        ret[k] = Marshaller.marshal(v, ctxt);
      }
    })

    return ret;
  }

  public unmarshal(value: object, ctxt: MarshallingContext): object {
    const ret = {};

    Object.entries(value).forEach(([k, v]) => {
      ret[k] = Marshaller.unmarshal(v, ctxt);
    });

    return ret;
  }
  
  static readonly ZipcMarshallerTypeMetadataKey = 'zipc.marshallerType';
}

export function UseMarshallerType(marshallerType: string): (target: any, propertyKey: string) => void {
  return function(target: any, propertyKey: string): void {
    Reflect.defineMetadata(DefaultMarshaller.ZipcMarshallerTypeMetadataKey, marshallerType, target, propertyKey);
  }  
}

@MarshallerType('weakRef')
export class WeakRefMarshaller extends Marshaller {
  public marshal(value: object): object {
    return { 
      ref: WeakObjectMonikerResolver.registerObject(value)
    };
  }

  public unmarshal(value: object, ctxt: MarshallingContext): object {
    return ctxt.client!.bindMoniker<any>(value['ref']);
  }

  static client: ZipcClient | null = null;
}