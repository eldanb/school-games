import { Component, OnInit } from '@angular/core';
import { LessonControllerProviderService } from './lesson-controller-provider.service';

@Component({
  selector: 'app-lesson-controller-provider',
  templateUrl: './lesson-controller-provider.component.html',
  providers: [LessonControllerProviderService]
})
export class LessonControllerProviderComponent implements OnInit {

  constructor(private _lessonControllerProviderService: LessonControllerProviderService) {
    this._lessonControllerProviderService.initSession();
  }

  ngOnInit(): void {

  }

}
