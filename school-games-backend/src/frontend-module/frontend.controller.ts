import {
  Controller,
  Get,
  Logger,
  LoggerService,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('/frontend/*')
export class FrontEndServeController {
  @Get()
  getFile(@Req() request: Request, @Res() response: Response) {
    const relPath = request.url.replace(/^\/frontend\//, '');

    const frontendDist = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'school-games-frontend',
      'dist',
      'school-games-frontend',
    );

    let filePath = path.join(frontendDist, relPath);
    if (
      (!fs.existsSync(filePath) && filePath.endsWith('.html')) ||
      !filePath.match(/\.[^\/]+$/)
    ) {
      filePath = path.join(frontendDist, 'index.html');
    }

    Logger.debug(`Serving ${filePath} for ${relPath}`);

    response.sendFile(filePath);
  }
}
