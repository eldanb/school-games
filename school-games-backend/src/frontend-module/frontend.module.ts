import { Module } from '@nestjs/common';
import { FrontEndServeController } from './frontend.controller';

@Module({
  imports: [],
  controllers: [FrontEndServeController],
  providers: [],
})
export class FrontEndModule {}
