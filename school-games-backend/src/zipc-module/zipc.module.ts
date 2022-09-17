import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ZipcApiController } from './ZipcApiController';

export type ZipcModuleOptions = {
  ipcEndpoint: string;
};
export class ZipcModule {
  static regsiter(options: ZipcModuleOptions): DynamicModule {
    return {
      module: ZipcModule,
      imports: [
        ZipcModuleInternal,
        RouterModule.register([
          {
            path: options.ipcEndpoint,
            module: ZipcModuleInternal,
          },
        ]),
      ],
    };
  }
}

@Module({
  controllers: [ZipcApiController],
})
export class ZipcModuleInternal {}
