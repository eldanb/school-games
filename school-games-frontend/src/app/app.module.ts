import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { GameComponentsModule } from 'src/game-components-module/game-components.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WordRoulettePageComponent } from './games/words-roulette/word-roulette-page/word-roulette-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { WordsRouletteRouletteComponent } from './games/words-roulette/words-roulette-roulette/words-roulette-roulette.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
    WordRoulettePageComponent,
    WordsRouletteRouletteComponent
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
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
