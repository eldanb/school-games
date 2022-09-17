export type ZipcRequest = {
  data: ZipcRequestData;
  headers?: ZipcRequestHeader[];
}

export type ZipcRequestData = {
  moniker: string;
  service: string;
  args: any[];
}

export type ZipcHeaders = {
  headers?: ZipcRequestHeader[]; 
}

export type ZipcRequestHeader = {}

export type ZipcResponse = (ZipcSuccess | ZipcError) & ZipcHeaders;

export type ZipcSuccess = {
  success: any;
}

export type ZipcError = {
  error: {
    message: string;
    stackTrace: string;
  }
}