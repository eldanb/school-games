import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouletteComponent } from './roulette/roulette.component';
import { WordListEditorComponent } from './word-list-editor/word-list-editor.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FavoritesSaveLoadDialogComponent } from './favorites-save-load-dialog/favorites-save-load-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { BackendHttpClient } from './backend-client/backend-http-client';
import { EditableStringListComponent } from './editable-string-list/editable-string-list.component';
import { LessonControllerProviderComponent } from './lesson-controller-provider/lesson-controller-provider.component';
import { FavoritesSaveLoadService } from './favorites-save-load-dialog/favorites-save-load.service';
import { RouterModule } from '@angular/router';
import { ZipcClientService } from './zipc-client-service/zipc-client.service';
import { LessonTerminalProviderComponent } from './lesson-terminal-provider/lesson-terminal-provider.component';
import { LessonStatusViewComponent } from './lesson-status-view/lesson-status-view.component';
import { PoppableBaloonsComponent } from './poppable-baloons/poppable-baloons.component';
import { FavoritesManagementButtonsComponent } from './favorites-management-buttons/favorites-management-buttons.component';
import { CountdownTimerDisplayComponent } from './countdown-timer-display/countdown-timer-display.component';
import { AvatarViewComponent } from 'src/game-components-module/avatar-view/avatar-view.component';
import { ScoreBoardViewComponent } from './score-board-view/score-board-view.component';
import { LightboxComponent } from './lightbox/lightbox.component';
import { StatusBarExtensionControlsComponent } from './status-bar-extension-controls/status-bar-extension-controls.component';

@NgModule({
  declarations: [
    RouletteComponent,
    WordListEditorComponent,
    FavoritesSaveLoadDialogComponent,
    EditableStringListComponent,
    LessonControllerProviderComponent,
    LessonTerminalProviderComponent,
    LessonStatusViewComponent,
    PoppableBaloonsComponent,
    FavoritesManagementButtonsComponent,
    CountdownTimerDisplayComponent,
    AvatarViewComponent,
    ScoreBoardViewComponent,
    LightboxComponent,
    StatusBarExtensionControlsComponent,
  ],
  providers: [
    FavoritesSaveLoadService,
    BackendHttpClient,
    ZipcClientService
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    RouletteComponent,
    WordListEditorComponent,
    EditableStringListComponent,
    LessonTerminalProviderComponent,
    LessonControllerProviderComponent,
    LessonStatusViewComponent,
    PoppableBaloonsComponent,
    FavoritesManagementButtonsComponent,
    CountdownTimerDisplayComponent,
    AvatarViewComponent,
    ScoreBoardViewComponent,
    LightboxComponent,
    StatusBarExtensionControlsComponent
  ]
})
export class GameComponentsModule { }
