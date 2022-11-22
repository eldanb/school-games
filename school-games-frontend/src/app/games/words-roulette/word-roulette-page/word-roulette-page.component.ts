import { AfterViewInit, Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { WordRouletteConsoleInterface } from 'school-games-common';
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

  private _rouletteConsoleController: WordRouletteConsoleInterface | null = null;

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
    const result = await lessonControlelr.startGame('word-roulette');
    this._rouletteConsoleController = result.gameController as WordRouletteConsoleInterface;
  }

  spinRoulette() {
    this.enableSelectedWordsDisplay = false;
    this.roulettes.forEach(roulette => roulette.spinRoulette());
  }

  rouletteDone() {
    if(!this.roulettes.find(roulette => roulette.isSpinning)) {
      this.enableSelectedWordsDisplay = true;
      if(this._rouletteConsoleController) {
        this._rouletteConsoleController.setRouletteResults(this.roulettes.map((roulette) => ({
          wheelDisplayName: roulette.title,
          wheelWord: roulette.selectedWord
        })))
      }
    }
  }

  get editingClass() {
    return this.editing ? ["editing"] : [];
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
