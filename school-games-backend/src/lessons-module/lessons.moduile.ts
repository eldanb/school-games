import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';

@Module({
  imports: [HttpModule],
  controllers: [LessonsController],
  providers: [],
})
export class LessonsModule {}
