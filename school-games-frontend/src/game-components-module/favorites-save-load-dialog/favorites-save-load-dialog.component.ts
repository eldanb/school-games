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
