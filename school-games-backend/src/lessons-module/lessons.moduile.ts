import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';

@Module({
  imports: [],
  controllers: [LessonsController],
  providers: [],
})
export class LessonsModule {}
