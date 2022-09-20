import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TerminalMessage } from 'school-games-common';
import { LessonTerminalProviderService } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';

@Component({
  templateUrl: './terminal-main-page.component.html',
  styleUrls: ['./terminal-main-page.component.scss']
})
export class TerminalMainPageComponent implements OnInit {

  lessonMoniker: string;


  constructor(private _route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.connectToLesson(this._route.snapshot.queryParams['mk']);
  }


  private connectToLesson(lessonMoniker: string) {
    this.lessonMoniker = lessonMoniker;
  }




}
