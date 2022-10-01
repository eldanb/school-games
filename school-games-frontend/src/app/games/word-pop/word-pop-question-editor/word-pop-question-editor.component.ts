import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export type WordPopQuestionDefinition = {
  question: string;
  validWords: string[];
  invalidWords: string[];
}

@Component({
  selector: 'app-word-pop-question-editor',
  templateUrl: './word-pop-question-editor.component.html',
  styleUrls: ['./word-pop-question-editor.component.scss']
})
export class WordPopQuestionEditorComponent implements OnInit {
  @Input()
  questionDefinition: WordPopQuestionDefinition;

  @Input()
  editWords: boolean;

  @Input()
  serialNumber: number;

  @Output()
  focusOnQuestion: EventEmitter<void> = new EventEmitter();

  @Output()
  deleteRequested: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  handleDeleteClicked() {
    this.deleteRequested.emit();
  }
}
