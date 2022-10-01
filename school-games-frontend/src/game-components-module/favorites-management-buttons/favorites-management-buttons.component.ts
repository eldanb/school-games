import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FavoritesSaveLoadService } from '../favorites-save-load-dialog/favorites-save-load.service';

@Component({
  selector: 'app-favorites-management-buttons',
  templateUrl: './favorites-management-buttons.component.html',
  styleUrls: ['./favorites-management-buttons.component.scss']
})
export class FavoritesManagementButtonsComponent implements OnInit {

  @Input()
  gameName: string;

  @Input()
  gameDefinition: any;

  @Output()
  gameDefinitionChange = new EventEmitter<any>();

  constructor(private _favService: FavoritesSaveLoadService) { }

  ngOnInit(): void {
  }

  async saveFavorites() {
    await this._favService.saveFavorites(
      this.gameName,
      {
        gameDefinition:  this.gameDefinition
      });
  }

  async loadFavorites() {
    const fav = await this._favService.loadFavorites(this.gameName);
    this.gameDefinitionChange.emit(fav.gameDefinition);
  }
}
