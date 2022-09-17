import { Body, Controller, Post } from '@nestjs/common';
import { ZipcServer } from 'school-games-common';
import { LiveObjectMonikerResolver } from 'school-games-common';

LiveObjectMonikerResolver;

@Controller('')
export class ZipcApiController {
  @Post('')
  async startLesson(@Body() body: any): Promise<any> {
    const resp = await new ZipcServer().handleRequest(body.request);
    return {
      response: resp,
    };
  }
}
