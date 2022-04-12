import { AfterViewChecked, Component, ElementRef, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendHttpClient } from '../backend-client/backend-http-client';
import { FavoriteDescriptor } from 'school-games-common';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface FavoritesSaveLoadDialogConfig {
  game: string;
  mode: "save" | "load";
}

@Component({
  selector: 'app-favorites-save-load-dialog',
  templateUrl: './favorites-save-load-dialog.component.html',
  styleUrls: ['./favorites-save-load-dialog.component.scss']
})
export class FavoritesSaveLoadDialogComponent implements OnInit {

  constructor(private backendApi: BackendHttpClient,
              private dlgRef: MatDialogRef<FavoritesSaveLoadDialogComponent, string | null>,
              @Inject(MAT_DIALOG_DATA) private dlgData: FavoritesSaveLoadDialogConfig) { }

  public favoritesList: FavoriteDescriptor[] | null = null;
  public favoriteNames: string[] = [];

  public inputFavoriteName: string;


  ngOnInit(): void {
    this.loadFavorites();
  }

  async loadFavorites() {
    this.favoritesList =
      (await this.backendApi.listFavorites(this.dlgData.game))
      .sort((a, b) => a.name.localeCompare(b.name))
    this.favoriteNames = this.favoritesList.map((f) => f.name);
  }

  get saving(): boolean {
    return this.dlgData.mode === "save";
  }

  get modeName(): string {
    return this.saving ? "שמור" : "טען";
  }

  favoriteClicked(favoriteIndex: number) {
    this.inputFavoriteName = this.favoritesList![favoriteIndex].name;
  }

  favoriteDoubleClicked(favoriteIndex: number) {
    this.inputFavoriteName = this.favoritesList![favoriteIndex].name;
    this.confirmDialog();
  }

  async deleteFavorite(favoriteIndex: number) {
    const deletedItem = this.favoritesList![favoriteIndex];
    await this.backendApi.deleteFavorite(this.dlgData.game, deletedItem.id);
    await this.loadFavorites();
  }

  async renameFavorite(renamed: [number, string]) {
    const [renamedIndex, renamedName] = renamed;
    const renamedItem = this.favoritesList![renamedIndex];
    await this.backendApi.renameFavorite(this.dlgData.game, renamedItem.id, renamedName);
    await this.loadFavorites();
  }

  cancelDialog() {
    this.dlgRef.close(null);
  }

  confirmDialog() {
    this.dlgRef.close(this.inputFavoriteName);
  }

  confirmAllowed(): boolean {
    if(this.saving) {
      return this.inputFavoriteName?.length > 0;
    } else {
      return this.favoriteNames.indexOf(this.inputFavoriteName) >= 0;
    }
  }


}

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
