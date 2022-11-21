import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';

import { GameComponentsModule } from 'src/game-components-module/game-components.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WordRoulettePageComponent } from './games/words-roulette/word-roulette-page/word-roulette-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { WordsRouletteRouletteComponent } from './games/words-roulette/words-roulette-roulette/words-roulette-roulette.component';
import { MatIconModule } from '@angular/material/icon';
import { ConsoleMainViewComponent } from './main-console/console-main-view/console-main-view.component';
import { TerminalMainPageComponent } from './terminal/terminal-main-page/terminal-main-page.component';
import { EmptyTerminalGamePageComponent } from './games/empty-terminal-game-page/empty-terminal-game-page.component';
import { TerminalGameComponentHostComponent } from './terminal/terminal-game-component-host/terminal-game-component-host.component';
import { WordRouletteTerminalPageComponent } from './games/words-roulette/word-roulette-terminal-page/word-roulette-terminal-page.component';
import { ConsoleUiFrameworkComponent } from './main-console/console-ui-framework/console-ui-framework.component';
import { LessonJoinQrcodeDialogComponent } from '../game-components-module/lesson-join-qrcode-dialog/lesson-join-qrcode-dialog.component';
import { WordPopTerminalPageComponent } from './games/word-pop/word-pop-terminal-page/word-pop-terminal-page.component';
import { WordPopConsolePageComponent } from './games/word-pop/word-pop-console-page/word-pop-console-page.component';
import { MatInputModule } from '@angular/material/input';
import { SendChatMessageDialogComponent } from './send-chat-message-dialog/send-chat-message-dialog.component';
import { ConsoleGamePageHostComponent } from './main-console/console-game-page-host/console-game-page-host.component';
import { WordPopQuestionEditorComponent } from './games/word-pop/word-pop-question-editor/word-pop-question-editor.component';
import { WikiRaceConsolePageComponent } from './games/wiki-race/wiki-race-console-page/wiki-race-console-page.component';
import { WikiRaceTerminalPageComponent } from './games/wiki-race/wiki-race-terminal-page/wiki-race-terminal-page.component';
import { WikiRacePathGraphComponent } from './games/wiki-race/wiki-race-path-graph/wiki-race-path-graph.component';
import { WikiTermSelectorComponent } from './games/wiki-race/wiki-term-selector/wiki-term-selector.component';
import { WikiRacePreRoundLightboxComponent } from './games/wiki-race/wiki-race-pre-round-lightbox/wiki-race-pre-round-lightbox.component';
import { LessonJoinQrDisplayComponent } from './lesson-join-qr-display/lesson-join-qr-display.component';

@NgModule({
  declarations: [
    AppComponent,
    WordRoulettePageComponent,
    WordsRouletteRouletteComponent,
    ConsoleMainViewComponent,
    TerminalMainPageComponent,
    EmptyTerminalGamePageComponent,
    TerminalGameComponentHostComponent,
    WordRouletteTerminalPageComponent,
    ConsoleUiFrameworkComponent,
    LessonJoinQrcodeDialogComponent,
    WordPopTerminalPageComponent,
    WordPopConsolePageComponent,
    SendChatMessageDialogComponent,
    ConsoleGamePageHostComponent,
    WordPopQuestionEditorComponent,
    WikiRaceConsolePageComponent,
    WikiRaceTerminalPageComponent,
    WikiRacePathGraphComponent,
    WikiTermSelectorComponent,
    WikiRacePreRoundLightboxComponent,
    LessonJoinQrDisplayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GameComponentsModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatInputModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
