import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FavoritesModule } from './favorites-module/favorites.module';
import { FrontEndModule } from './frontend-module/frontend.module';

@Module({
  imports: [FrontEndModule, FavoritesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
