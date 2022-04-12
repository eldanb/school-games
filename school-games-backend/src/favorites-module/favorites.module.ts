import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';

@Module({
  imports: [],
  controllers: [FavoritesController],
  providers: [],
})
export class FavoritesModule {}
