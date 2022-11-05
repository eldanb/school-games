import { Component, ComponentRef, OnDestroy, OnInit, Self, ViewChild, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TerminalAvatar, TerminalMessage } from 'school-games-common';
import { AvatarViewComponent } from 'src/game-components-module/avatar-view/avatar-view.component';
import { LessonTerminalProviderComponent } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.component';
import { TerminalConnectionState } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';


export class TerminalUiFrameworkIntegrationSupportService {
  private _component: TerminalMainPageComponent;

  connectComponent(component: TerminalMainPageComponent) {
    this._component = component;
  }

  get pageTitle(): string {
    return this._component.pageTitle;
  }

  set pageTitle(v: string) {
    this._component.pageTitle = v;
  }
}

@Component({
  templateUrl: './terminal-main-page.component.html',
  styleUrls: ['./terminal-main-page.component.scss'],
  providers: [TerminalUiFrameworkIntegrationSupportService]
})
export class TerminalMainPageComponent implements OnInit {

  username: string;
  pageTitle: string;

  suggestedAvatars: TerminalAvatar[];
  selectedAvatarIndex: number = 0;

  get selectedAvatar() { return this.suggestedAvatars[this.selectedAvatarIndex]; };

  @ViewChild(LessonTerminalProviderComponent)
  _lessonTerminalProvider: LessonTerminalProviderComponent;

  constructor(
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    @Self() private _integrationServices: TerminalUiFrameworkIntegrationSupportService) {
  }

  ngOnInit(): void {
    this._integrationServices.connectComponent(this);
    this.suggestedAvatars = [];
    for(let i=0; i<3; i++) {
      this.suggestedAvatars.push(AvatarViewComponent.randomAvatar());
    }
  }

  private connectToLesson(lessonMoniker: string) {
    return this._lessonTerminalProvider.connectToLesson(lessonMoniker, this.username, this.selectedAvatar);
  }

  get connectionState() {
    return this._lessonTerminalProvider?.connectionState || 'nc';
  }

  handleConnectClicked() {
    this.connectToLesson(this._route.snapshot.queryParams['mk'])
      .catch((e) => alert(`Error connecting:\n\n${e}`));
  }

  handleTerminalMessage(terminalMessage: TerminalMessage) {
    if(terminalMessage.type === "chat-notification") {
      this._snackBar.open(terminalMessage.text, undefined, {
        duration: 3000,
        panelClass: "rtl-snackbar"
      });
    }
  }
}
