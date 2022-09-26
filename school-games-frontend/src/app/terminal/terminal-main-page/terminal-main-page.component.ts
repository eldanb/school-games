import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './terminal-main-page.component.html',
  styleUrls: ['./terminal-main-page.component.scss']
})
export class TerminalMainPageComponent implements OnInit {

  lessonMoniker: string;
  lessonConnected: boolean;
  username: string;

  constructor(private _route: ActivatedRoute) {
  }

  ngOnInit(): void {
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
}
