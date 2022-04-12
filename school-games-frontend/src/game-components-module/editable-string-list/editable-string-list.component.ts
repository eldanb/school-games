import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-editable-string-list',
  templateUrl: './editable-string-list.component.html',
  styleUrls: ['./editable-string-list.component.scss']
})
export class EditableStringListComponent implements OnInit, OnChanges {
  @Input()
  stringList: string[];

  editedStrings: string[];

  @Output()
  deleteString: EventEmitter<number> = new EventEmitter();

  @Output()
  renameString: EventEmitter<[number, string]> = new EventEmitter();

  @Output()
  stringDoubleClick: EventEmitter<number> = new EventEmitter();

  @Output()
  stringClick: EventEmitter<number> = new EventEmitter();

  private renamedItem: number | null;

  @ViewChild('renameField', { static: false })
  renameField: ElementRef<HTMLInputElement>;

  renamedName: string | null;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['stringList']) {
      this.renamedItem = null;
      this.editedStrings = this.stringList.concat();
    }
  }

  ngOnInit(): void {
  }

  fireStringClick(index: number) {
    this.stringClick.emit(index);
  }

  fireStringDoubleClick(index: number) {
    this.stringDoubleClick.emit(index);
  }

  doDeleteString(index: number) {
    this.editedStrings.splice(index, 1);
    this.deleteString.emit(index);
  }

  doEditString(index: number) {
    this.renamedName = this.editedStrings[index];
    this.renamedItem = index;

    setTimeout(() => {
      if(this.renameField.nativeElement) {
        this.renameField.nativeElement.focus();
      }
    }, 0);
  }

  completeRenameString() {
    if(this.renamedName && this.renamedItem !== null) {
      this.editedStrings[this.renamedItem] = this.renamedName;
      this.renameString.emit([this.renamedItem, this.renamedName]);
    }

    this.renamedItem = null;
  }

  renaming(index: number): boolean {
    return this.renamedItem === index;
  }
}
