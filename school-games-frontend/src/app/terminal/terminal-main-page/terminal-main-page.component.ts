import { Component, OnDestroy, OnInit, Self, ViewChild, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TerminalMessage } from 'school-games-common';


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

  lessonMoniker: string;
  lessonConnected: boolean;
  username: string;
  pageTitle: string;

  constructor(
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    @Self() private _integrationServices: TerminalUiFrameworkIntegrationSupportService) {
  }

  ngOnInit(): void {
    this._integrationServices.connectComponent(this);
  }

  private connectToLesson(lessonMoniker: string) {
    this.lessonMoniker = lessonMoniker;
  }

  connectionStateChanged(state: boolean) {
    this.lessonConnected = state;
  }


  handleConnectClicked() {
    this.connectToLesson(this._route.snapshot.queryParams['mk']);
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
