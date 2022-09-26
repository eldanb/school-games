import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { TerminalMessage } from 'school-games-common';
import { LessonTerminalProviderService } from './lesson-terminal-provider.service';

@Component({
  selector: 'app-lesson-terminal-provider',
  templateUrl: './lesson-terminal-provider.component.html',
  providers: [LessonTerminalProviderService]
})
export class LessonTerminalProviderComponent implements OnInit, OnDestroy {

  private _lessonMoniker: string | null;
  private _username: string | null;
  private _terminalEventSubscription: Subscription| null;

  @Input()
  get lessonMoniker(): string | null {
    return this._lessonMoniker;
  }

  set lessonMoniker(v: string | null) {
    this._lessonMoniker = v;
    this._connectIfNeeded();
  }

  @Input()
  get username(): string | null {
    return this._username;
  }

  set username(v: string | null) {
    this._username = v;
    this._connectIfNeeded();
  }

  @Output()
  connectionStateChange: EventEmitter<boolean> = new EventEmitter();

  @Output()
  terminalMessage: EventEmitter<TerminalMessage> = new EventEmitter();

  constructor(private _lessonTerminalProviderService: LessonTerminalProviderService) {
  }

  ngOnInit(): void {
    this._terminalEventSubscription = this._lessonTerminalProviderService.onTerminalMessage.subscribe((event) =>
      this.terminalMessage.emit(event));
  }

  ngOnDestroy(): void {
    if(this._terminalEventSubscription) {
      this._terminalEventSubscription.unsubscribe();
    }
  }

  _connectIfNeeded() {
    if(this._lessonMoniker && this._username) {
      this._lessonTerminalProviderService.initTerminal(this._lessonMoniker, this._username);
      this._lessonTerminalProviderService.getTerminalInterface().then(() => this.connectionStateChange.emit(true));
    }
  }
}
