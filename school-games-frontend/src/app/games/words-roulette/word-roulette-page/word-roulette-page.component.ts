import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FavoritesSaveLoadService } from 'src/game-components-module/favorites-save-load-dialog/favorites-save-load.service';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';
import { WordRouletteGameDefinition, WordRouletteWheelDefinition } from '../word-roulette-game-settings';
import { WordsRouletteRouletteComponent } from '../words-roulette-roulette/words-roulette-roulette.component';

@Component({
  selector: 'app-word-roulette-page',
  templateUrl: './word-roulette-page.component.html',
  styleUrls: ['./word-roulette-page.component.scss']
})
export class WordRoulettePageComponent implements OnInit {

  gameDefinition: WordRouletteGameDefinition = {
    wheelDefinitions: [
      {
        wheelTitle: "דמות",
        wheelWordlist: ['מילה', ' כיסא', 'פסנתר', 'בצל', 'פנס', 'רובה', 'מעדר', 'שנאי']
      },
      {
        wheelTitle: "זמן",
        wheelWordlist: ['בית-ספר', 'קניון', 'בית', 'מערה', 'נחל', 'מגרש', 'חדר', 'מסעדה']

      },
      {
        wheelTitle: "מקום",
        wheelWordlist: ['גבוה', 'נמוך', 'יציב', 'ארוך', 'חדש', 'משוכלל' ]
      }
    ]
  }

  public editing: boolean = false;
  public enableSelectedWordsDisplay: boolean = true;

  @ViewChildren('roulette')
  roulettes: QueryList<WordsRouletteRouletteComponent>;


  constructor(
    private _favService: FavoritesSaveLoadService,
    private _lessonControllerProviderService: LessonControllerProviderService) { }

  ngOnInit(): void {
    this._startGame();
  }

  private async _startGame() {
    const lessonControlelr = await this._lessonControllerProviderService.getLessonController();
    await lessonControlelr.startGame('word-roulette');
  }

  spinRoulette() {
    this.enableSelectedWordsDisplay = false;
    this.roulettes.forEach(roulette => roulette.spinRoulette());
  }

  rouletteDone() {
    if(!this.roulettes.find(roulette => roulette.isSpinning)) {
      this.enableSelectedWordsDisplay = true;
    }
  }

  get editingClass() {
    return this.editing ? ["editing"] : [];
  }

  async saveFavorites() {
    await this._favService.saveFavorites(
      "words-roulette",
      {
        gameDefinition:  this.gameDefinition
      });
  }

  async loadFavorites() {
    const fav = await this._favService.loadFavorites("words-roulette");
    this.gameDefinition = fav.gameDefinition;
  }

  updateWordList(wheelDefinition: WordRouletteWheelDefinition, wordList: string[]) {
    this.updateGameDefinition((gameDef) => {
      wheelDefinition.wheelWordlist = wordList;
    })
  }

  deleteWheel(wheelDefinition: WordRouletteWheelDefinition) {
    this.updateGameDefinition((gameDef) => {
      const updatedWheels = gameDef.wheelDefinitions.filter(def => def != wheelDefinition);
      gameDef.wheelDefinitions = updatedWheels;
    })
  }

  renameWheel(wheelDefinition: WordRouletteWheelDefinition, newName: string) {
    this.updateGameDefinition((gameDef) => {
      wheelDefinition.wheelTitle = newName;
    });
  }

  addWheel() {
    this.updateGameDefinition((gameDef) => {
      gameDef.wheelDefinitions.push({
        wheelTitle: "כותרת",
        wheelWordlist: [ "מילה 1", "מילה 2", "מילה 3"]
      });
    })
  }

  private updateGameDefinition(fn: (gameDefinition: WordRouletteGameDefinition) => void) {
    fn(this.gameDefinition);
    this.gameDefinition = Object.assign({}, this.gameDefinition);
  }

}
