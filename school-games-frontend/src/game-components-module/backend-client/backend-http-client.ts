import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { FavoriteDescriptor } from "school-games-common";

@Injectable()
export class BackendHttpClient {
  constructor(private httpClient: HttpClient) {
  }

  async listFavorites(game: string): Promise<FavoriteDescriptor[]> {
    return firstValueFrom(
      this.httpClient.get<FavoriteDescriptor[]>(`/api/game-favorites/${game}/list`));
  }

  async loadFavorite(game: string, loadedFilename: string) {
    return firstValueFrom(
      this.httpClient.get<any>(`/api/game-favorites/${game}/fav/${loadedFilename}`));
  }

  async saveFavorite(game: string, savedFilename: string, favorites: any) {
    return firstValueFrom(
      this.httpClient.post<{}>(`/api/game-favorites/${game}/fav/${savedFilename}`, favorites));
  }

  async renameFavorite(game: string, id: string, name: string) {
    return firstValueFrom(
      this.httpClient.post<{}>(`/api/game-favorites/${game}/rename`, {id, name}));
  }

  async deleteFavorite(game: string, id: string) {
    return firstValueFrom(
      this.httpClient.post<{}>(`/api/game-favorites/${game}/delete`, {id}));
  }

}
