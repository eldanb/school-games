import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  MonikerWithEndpointResolver,
  ZipcClient,
  ZipClientTransport,
  ZipcServer,
} from 'school-games-common';
import { LiveObjectMonikerResolver } from 'school-games-common';
import { WeakValueMap } from 'school-games-common/dist/zipc/core/WeakValueMap';
import { ZipcCallContext } from 'school-games-common/dist/zipc/server/ZipcCallContext';

LiveObjectMonikerResolver;

export class EndpointMultiplexingZipcTransport implements ZipClientTransport {
  async transact(moniker: string, request: string): Promise<string> {
    const [ep, _] =
      MonikerWithEndpointResolver.getMonikerEndpointAndUnderlying(moniker);
    const epTransport = EndpointMultiplexingZipcTransport._endpointMap.get(ep);
    if (epTransport) {
      return await epTransport.transact(moniker, request);
    } else {
      throw new Error(`Endpoint ${ep} not found`);
    }
  }

  static registerEndpoint(endpoint: string, transport: ZipClientTransport) {
    this._endpointMap.put(endpoint, transport);
  }

  private static _endpointMap = new WeakValueMap<string, ZipClientTransport>();
}

const queueMultpliexingZipcClient = new ZipcClient(
  new EndpointMultiplexingZipcTransport(),
);

@Controller('')
export class ZipcApiController {
  @Post('')
  async startLesson(@Body() body: any): Promise<any> {
    const callContext = new ZipcCallContext(
      'terminal',
      {},
      queueMultpliexingZipcClient,
    );

    const resp = await new ZipcServer().handleRequest(
      body.request,
      callContext,
    );

    return {
      response: resp,
    };
  }
}
