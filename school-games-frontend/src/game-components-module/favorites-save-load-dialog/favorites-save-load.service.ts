import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BackendHttpClient } from "../backend-client/backend-http-client";
import { FavoritesSaveLoadDialogComponent, FavoritesSaveLoadDialogConfig } from "./favorites-save-load-dialog.component";

@Injectable()
export class FavoritesSaveLoadService {
  constructor(
    private backendApi: BackendHttpClient,
    private snackbarService: MatSnackBar,
    private matDialog: MatDialog) {
  }

  private openDialog(config: FavoritesSaveLoadDialogConfig) {
    return new Promise<string>((accept, reject) => {
      const openRef = this.matDialog.open<FavoritesSaveLoadDialogComponent, FavoritesSaveLoadDialogConfig>(
        FavoritesSaveLoadDialogComponent,
        {
          width: "70%",
          height: "60%",
          data: config
        });

      openRef.afterClosed().subscribe({
        next(v: string | null): void {
            if(v) {
              accept(v);
            } else {
              reject(new Error("Cancelled"));
            }
        }
      });
    });
  }

  async saveFavorites(game: string, favorites: any) {
    const savedFilename = await this.openDialog({
      game,
      mode: "save"
    });

    try {
      await this.backendApi.saveFavorite(game, savedFilename, favorites);
      this.snackbarService.open("השמירה בוצעה בהצלחה", undefined, { duration: 1000 });
    } catch(e) {
      this.snackbarService.open("שגיאה בעת ביצוע שמירה", undefined, { duration: 1000 });
      console.error("Error while saving favorite", e);
    }
  }


  async loadFavorites(game: string) {
    const loadedFilename = await this.openDialog({
      game,
      mode: "load"
    });

    return (await this.backendApi.loadFavorite(game, loadedFilename)).data;
  }
}
