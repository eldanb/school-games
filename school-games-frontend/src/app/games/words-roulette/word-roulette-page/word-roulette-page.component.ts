import { Component, OnInit, ViewChild } from '@angular/core';
import { FavoritesSaveLoadService } from '../../../../game-components-module/favorites-save-load-dialog/favorites-save-load-dialog.component';
import { WordsRouletteRouletteComponent } from '../words-roulette-roulette/words-roulette-roulette.component';

@Component({
  selector: 'app-word-roulette-page',
  templateUrl: './word-roulette-page.component.html',
  styleUrls: ['./word-roulette-page.component.scss']
})
export class WordRoulettePageComponent implements OnInit {

  @ViewChild('roulette1')
  roulette1: WordsRouletteRouletteComponent;

  @ViewChild('roulette2')
  roulette2: WordsRouletteRouletteComponent;

  @ViewChild('roulette3')
  roulette3: WordsRouletteRouletteComponent;

  wordList1: string[] = ['מילה', ' כיסא', 'פסנתר', 'בצל', 'פנס', 'רובה', 'מעדר', 'שנאי'];
  wordList2: string[] = ['בית-ספר', 'קניון', 'בית', 'מערה', 'נחל', 'מגרש', 'חדר', 'מסעדה'];
  wordList3: string[] = ['גבוה', 'נמוך', 'יציב', 'ארוך', 'חדש', 'משוכלל' ];

  public editing: boolean = false;
  public enableSelectedWordsDisplay: boolean = true;

  constructor(private favService: FavoritesSaveLoadService) { }

  ngOnInit(): void {
  }


  spinRoulette() {
    this.enableSelectedWordsDisplay = false;

    this.roulette1.spinRoulette();
    this.roulette2.spinRoulette();
    this.roulette3.spinRoulette();
  }

  rouletteDone() {
    if(!this.roulette1.isSpinning &&
       !this.roulette2.isSpinning &&
       !this.roulette3.isSpinning) {
         this.enableSelectedWordsDisplay = true;
    }
  }

  get editingClass() {
    return this.editing ? ["editing"] : [];
  }

  async saveFavorites() {
    await this.favService.saveFavorites(
      "words-roulette",
      {
        wordList1: this.roulette1.wordList,
        wordList2: this.roulette2.wordList,
        wordList3: this.roulette3.wordList
      });
  }

  async loadFavorites() {
    const fav = await this.favService.loadFavorites("words-roulette");
    this.wordList1 = fav.wordList1 || [];
    this.wordList2 = fav.wordList2 || [];
    this.wordList3 = fav.wordList3 || [];
  }
}
