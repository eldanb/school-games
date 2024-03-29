import { Component, OnDestroy, OnInit } from '@angular/core';
import { PoppedWordGameboard, PoppedWordGameStatus, WordPopConsoleInterface } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';
import { ScoreBoardColumnDefinition, ScoreBoardEntry } from 'src/game-components-module/score-board-view/score-board-view.component';
import { WordPopQuestionDefinition } from '../word-pop-question-editor/word-pop-question-editor.component';

@Component({
  templateUrl: './word-pop-console-page.component.html',
  styleUrls: ['./word-pop-console-page.component.scss']
})
export class WordPopConsolePageComponent implements OnInit, OnDestroy {
  private _wordpopGameController: WordPopConsoleInterface;
  private _refreshInterval: any = null;

  gameTitle: string = "שורשים";
  gameQuestionDefs: WordPopQuestionDefinition[] = [
    {
      question: "מילים מהשורש ש.מ.ר",
      validWords: [
        "שמר",
        "אשמור",
        "ישמור",
        "תשמורנה",
        "שמרו",
      ],
      invalidWords: [
        "שמרים",
        "חלב",
        "חביצה",
      ],
    },
    {
      question: "q2",
      validWords: [ "w2" ],
      invalidWords: [ "ww2" ],
    },
  ];

  scoreboardCols: ScoreBoardColumnDefinition[] = [
    {
      heading: "נכון",
      width: "7rem",
      class: "scoreboard-col-right"
    },

    {
      heading: "לא נכון",
      width: "7rem",
      class: "scoreboard-col-wrong"
    },

    {
      heading: "ניקוד",
      width: "7rem",
      class: "scoreboard-col-right"
    },

  ];

  get gameDefinition() {
    return {
      gameTitle: this.gameTitle,
      gameQuestionDefs: this.gameQuestionDefs
    }
  }

  set gameDefinition(v: any) {
    this.gameTitle = v.gameTitle;
    this.gameQuestionDefs = v.gameQuestionDefs;
  }

  editedQuestion: WordPopQuestionDefinition | null;

  editing: boolean = false;

  gameStatus: PoppedWordGameStatus = { gameState: 'not-started', terminalStatus: {}, endTime: null };
  sampleBoard: PoppedWordGameboard;

  get hasMoreQuestions() {
    return this._runningQuestionIndex < this.gameQuestionDefs.length-1;
  }

  private _runningQuestionIndex: number = -1;
  private get _runningQuestion() {
    return this._runningQuestionIndex>=0 ? this.gameQuestionDefs[this._runningQuestionIndex] : null;
  }

  constructor(
    public lessonControllerService: LessonControllerProviderService) { }

  ngOnInit(): void {
    this.setupGame();
    this._refreshInterval = setInterval(() => this.refreshStatus(), 500);
  }

  ngOnDestroy(): void {
    if(this._refreshInterval != null) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  }

  get terminalIds() {
    return Object.keys(this.gameStatus.terminalStatus).filter((k) => k != '$m');
  }

  private async setupGame() {
    const lessonController = await this.lessonControllerService.getLessonController();
    const startResult = await lessonController.startGame("word-pop");
    this._wordpopGameController = startResult.gameController as WordPopConsoleInterface;
  }

  private async refreshStatus() {
    const prevGameState = this.gameStatus?.gameState;

    this.gameStatus = await this._wordpopGameController.getGameStatus();

    if(this.gameStatus?.gameState !== prevGameState) {
      switch(this.gameStatus?.gameState) {
        case 'all-done':
          this.arrangeBaloonsByCorrectness();
          break;
      }
    }
  }

  private arrangeBaloonsByCorrectness() {
    let numCorrect = 0;
    let numWrong = 0;
    this.sampleBoard.baloons.forEach(baloon => {
      if(this._runningQuestion!.validWords.indexOf(baloon.word)>=0) {
        baloon.position.x = 10 + (numCorrect % 2) * 40;
        baloon.position.y = 10 + numCorrect * 80;
        numCorrect++;

      } else {
        baloon.position.x = 330 + (numWrong % 2) * 40;
        baloon.position.y = 10 + numWrong * 80;
        numWrong++;
      }
    });
  }

  public async startGame() {
    this._runningQuestionIndex = -1;
    await this.startQuestion();
  }

  public async startQuestion() {
    this._runningQuestionIndex++;

    // Kludge: hide end-of-game indicators before
    // starting the next question
    this.gameStatus.gameState = 'playing';

    if(this._runningQuestion) {
      this.sampleBoard = await this._wordpopGameController.startQuestion(
        this._runningQuestion,
        120);
    }
  }

  handleClickOnQuestionListContainer(event: Event): void {
    if(event.eventPhase == Event.AT_TARGET) {
      this.editedQuestion = null;
    }
  }

  handleDeleteQuestion(questionIndex: number) {
    this.gameQuestionDefs.splice(questionIndex, 1);
  }

  handleAddQuestion() {
    this.gameQuestionDefs.push({
      question: "",
      invalidWords: [],
      validWords: []
    })
  }

  get scoreboardData(): ScoreBoardEntry[] {
    const ret = Object.values(this.gameStatus.terminalStatus).map(ts => ({
      terminalId: ts.username,
      username: ts.username,
      avatar: ts.avatar,
      class: ts.playerCompleted ? 'scoreboard-row-completed' : '',
      additionalFields: [ts.goodPops, ts.badPops, ts.goodPops - ts.badPops]
    }));

    ret.sort((a, b) => b.additionalFields[2] - a.additionalFields[2]);
    return ret;
  }
}
