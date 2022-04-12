import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import { FavoriteDescriptor } from 'school-games-common';

const MAX_FAVORITE_ENTRIES = 100;
const MAX_FAVORITE_SIZE = 16384;

interface FavoriteData {
  name: string;
  data: any;
}

@Controller('api/game-favorites')
export class FavoritesController {
  @Post(':game/fav/:favorite')
  async saveFavorite(
    @Param() params,
    @Body() body: any,
  ): Promise<Record<string, never>> {
    if (JSON.stringify(body).length > MAX_FAVORITE_SIZE) {
      throw new Error('Favorite content too long');
    }

    if (!params.favorite) {
      throw new Error('Missing favorite name');
    }

    const currentDb = await this.loadFavoritesDb(params.game);

    if (Object.keys(currentDb).length > MAX_FAVORITE_ENTRIES) {
      throw new Error('Too many favorite entries!');
    }

    currentDb[params.favorite] = {
      name: params.favorite,
      data: body,
    };

    await this.saveFavoritesDb(params.game, currentDb);

    return {};
  }

  @Get(':game/fav/:favorite')
  async loadFavorite(@Param() params): Promise<FavoriteData> {
    const currentDb = await this.loadFavoritesDb(params.game);
    const fav = currentDb[params.favorite];
    if (!fav) {
      throw new NotFoundException('Not found');
    }

    return fav;
  }

  @Post(':game/rename')
  async renameFavorite(
    @Param() params,
    @Body() body: { id: string; name: string },
  ): Promise<Record<string, never>> {
    const currentDb = await this.loadFavoritesDb(params.game);

    const existingFavorite = currentDb[body.id];
    delete currentDb[body.id];

    existingFavorite.name = body.name;
    currentDb[body.name] = existingFavorite;

    await this.saveFavoritesDb(params.game, currentDb);

    return {};
  }

  @Post(':game/delete')
  async deleteFavorite(
    @Param() params,
    @Body() body: { id: string },
  ): Promise<Record<string, never>> {
    const currentDb = await this.loadFavoritesDb(params.game);

    delete currentDb[body.id];

    await this.saveFavoritesDb(params.game, currentDb);

    return {};
  }

  @Get(':game/list')
  async getFavoritesList(@Param() params): Promise<FavoriteDescriptor[]> {
    const db = await this.loadFavoritesDb(params.game);
    return Object.values(db).map((i) => ({
      id: i.name,
      name: i.name,
    }));
  }

  private async saveFavoritesDb(
    game: string,
    data: Record<string, FavoriteData>,
  ): Promise<void> {
    await writeFile(
      path.join('data', game, `favorites.json`),
      JSON.stringify(data),
    );
  }

  private async loadFavoritesDb(
    game: string,
  ): Promise<Record<string, FavoriteData>> {
    const fname = path.join('data', game, `favorites.json`);

    if (!existsSync(fname)) {
      return {};
    }

    const jsonContents = await readFile(fname);
    return JSON.parse(jsonContents.toString('utf-8'));
  }
}
