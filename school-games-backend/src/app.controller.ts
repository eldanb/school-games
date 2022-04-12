import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, Request } from 'express';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(@Req() request: Request, @Res() response: Response) {
    response.redirect('/frontend/');
  }
}
