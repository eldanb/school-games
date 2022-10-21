import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WikiProxyController } from './proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [WikiProxyController],
  providers: [],
})
export class WikiProxyModule {}
