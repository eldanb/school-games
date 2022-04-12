import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-word-list-editor',
  templateUrl: './word-list-editor.component.html',
  styleUrls: ['./word-list-editor.component.scss']
})
export class WordListEditorComponent implements OnInit {

  @Input()
  editedWordList: string[];

  @Output()
  editedWordListChange: EventEmitter<string[]> = new EventEmitter()

  addedWord: string;
  constructor() { }

  ngOnInit(): void {
  }

  deleteItem(index: number) {
    this.editedWordList = this.editedWordList.concat();
    this.editedWordList.splice(index, 1);
    this.editedWordListChange.emit(this.editedWordList);
  }

  renameItem(event: [number, string]) {
    const [index, name] = event;
    this.editedWordList = this.editedWordList.concat();
    this.editedWordList[index] = name;
    this.editedWordListChange.emit(this.editedWordList);
  }

  addWordClicked() {
    if(this.addedWord.length) {
      this.editedWordList = this.editedWordList.concat([this.addedWord]);
      this.addedWord = "";
      this.editedWordListChange.emit(this.editedWordList);
    }
  }
}
