import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouletteComponent } from './roulette/roulette.component';
import { WordListEditorComponent } from './word-list-editor/word-list-editor.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FavoritesSaveLoadDialogComponent, FavoritesSaveLoadService } from './favorites-save-load-dialog/favorites-save-load-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { BackendHttpClient } from './backend-client/backend-http-client';
import { EditableStringListComponent } from './editable-string-list/editable-string-list.component';

@NgModule({
  declarations: [
    RouletteComponent,
    WordListEditorComponent,
    FavoritesSaveLoadDialogComponent,
    EditableStringListComponent,
  ],
  providers: [
    FavoritesSaveLoadService,
    BackendHttpClient,
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  exports: [
    RouletteComponent,
    WordListEditorComponent,
    EditableStringListComponent
  ]
})
export class GameComponentsModule { }
