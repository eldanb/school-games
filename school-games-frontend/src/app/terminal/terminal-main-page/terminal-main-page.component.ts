import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
