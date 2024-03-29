import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { RouletteComponent } from 'src/game-components-module/roulette/roulette.component';

@Component({
  selector: 'app-words-roulette-roulette',
  templateUrl: './words-roulette-roulette.component.html',
  styleUrls: ['./words-roulette-roulette.component.scss']
})
export class WordsRouletteRouletteComponent implements OnInit {
  @Input()
  wordList: string[]

  @Output()
  wordListChange: EventEmitter<string[]> = new EventEmitter();

  @Output()
  wheelDelete: EventEmitter<void> = new EventEmitter;

  @Output()
  wheelRename: EventEmitter<string> = new EventEmitter;

  @Input()
  enableSelectedWord: boolean;

  @Input()
  title: string;

  @Output()
  done: EventEmitter<string> = new EventEmitter()

  @ViewChild('roulette')
  roulette: RouletteComponent;

  private editingState: boolean;
  public editingTitle: boolean = false;
  public renamedTitle: string;
  constructor() { }

  ngOnInit(): void {
  }

  spinRoulette() {
    this.roulette.spin(12 + Math.random() * 12);
  }

  fireRouletteDone() {
    this.done.emit(this.roulette.selectedWord!);
  }

  rouletteClicked() {
    if(!this.editing) {
      this.spinRoulette();
    }
  }

  get editingClass() {
    return this.editing ? ["display"] : [];
  }

  @Input()
  get editing(): boolean {
    return this.editingState;
  }

  set editing(v: boolean) {
    this.editingState = v;
  }

  get selectedWord(): string | null {
    return this.roulette?.selectedWord;
  }

  get isSpinning(): boolean {
    return this.roulette?.isSpinning || false;
  }

  get showSelectedWord(): boolean {
    return this.enableSelectedWord && !this.editing && !this.roulette?.isSpinning;
  }

  onEditWordListChange(wordList: string[]) {
    this.wordListChange.emit(wordList);
  }

  onDeleteWheelClicked() {
    this.wheelDelete.emit();
  }

  onRenameWheelClicked() {
    this.renamedTitle = this.title;
    this.editingTitle = true;
  }

  completeRenameWheel() {
    this.editingTitle = false;
    this.wheelRename.emit(this.renamedTitle);
  }
}
