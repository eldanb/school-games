import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FavoritesModule } from './favorites-module/favorites.module';
import { FrontEndModule } from './frontend-module/frontend.module';
import { LessonsModule } from './lessons-module/lessons.moduile';
import { ZipcModule } from './zipc-module/zipc.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FrontEndModule,
    FavoritesModule,
    LessonsModule,
    ZipcModule.regsiter({
      ipcEndpoint: '/api/zipc',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
