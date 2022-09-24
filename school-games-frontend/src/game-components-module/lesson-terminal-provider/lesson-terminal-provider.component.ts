import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LessonTerminalProviderService } from './lesson-terminal-provider.service';

@Component({
  selector: 'app-lesson-terminal-provider',
  templateUrl: './lesson-terminal-provider.component.html',
  providers: [LessonTerminalProviderService]
})
export class LessonTerminalProviderComponent implements OnInit {

  @Input()
  lessonMoniker: string;

  @Output()
  connectionStateChange: EventEmitter<boolean> = new EventEmitter();

  constructor(private _lessonTerminalProviderService: LessonTerminalProviderService) {
  }

  ngOnInit(): void {
    this._lessonTerminalProviderService.initTerminal(this.lessonMoniker);
    this._lessonTerminalProviderService.getTerminalInterface().then(() => this.connectionStateChange.emit(true));
  }

}
