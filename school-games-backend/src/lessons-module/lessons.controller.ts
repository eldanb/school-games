import { HttpService } from '@nestjs/axios';
import { Body, Controller, LoggerService, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LiveObjectMonikerResolver,
  StartLessonRequestBody,
  StartLessonResponseBody,
} from 'school-games-common';
import { LessonControllerImpl } from './lib/LessonControllerImpl';

@Controller('api/lessons')
export class LessonsController {
  constructor(
    private _configService: ConfigService,
    private _httpService: HttpService,
  ) {}

  @Post('start')
  async startLesson(
    @Body() body: StartLessonRequestBody,
  ): Promise<StartLessonResponseBody> {
    const lessonController = new LessonControllerImpl(
      this._configService,
      this._httpService,
    );
    const moniker = LiveObjectMonikerResolver.registerObject(lessonController);

    return {
      moniker: moniker,
    };
  }
}
