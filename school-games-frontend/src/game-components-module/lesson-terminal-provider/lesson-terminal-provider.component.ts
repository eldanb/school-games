import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { TerminalAvatar, TerminalMessage } from 'school-games-common';
import { LessonTerminalProviderService, TerminalConnectionState } from './lesson-terminal-provider.service';

@Component({
  selector: 'app-lesson-terminal-provider',
  templateUrl: './lesson-terminal-provider.component.html',
  providers: [LessonTerminalProviderService]
})
export class LessonTerminalProviderComponent implements OnInit, OnDestroy {

  private _lessonMoniker: string | null;
  private _username: string | null;
  private _avatar: TerminalAvatar | null;
  private _terminalEventSubscription: Subscription| null;

  public connectToLesson(lessonMoniker: string, username: string, avatar: TerminalAvatar) {
    this._lessonMoniker = lessonMoniker;
    this._username = username;
    this._avatar = avatar;

    this._lessonTerminalProviderService.initTerminal(
      this._lessonMoniker,
      this._username,
      this._avatar);
  }

  @Output()
  terminalMessage: EventEmitter<TerminalMessage> = new EventEmitter();

  constructor(private _lessonTerminalProviderService: LessonTerminalProviderService) {
  }

  get connectionState() {
    return this._lessonTerminalProviderService?.connectionState || 'nc';
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
}
