import { Injectable, OnDestroy } from "@angular/core";
import { LessonControllerInterface, LessonStatus, MonikerResolver } from "school-games-common";
import { BackendHttpClient } from "../backend-client/backend-http-client";
import { ZipcClientService } from "../zipc-client-service/zipc-client.service";

@Injectable()
export class LessonControllerProviderService implements OnDestroy {
  private _asyncLoadedLessonController: Promise<LessonControllerInterface>;
  private _refreshTimer: any;
  private _lessonStatus: LessonStatus | null;

  constructor(private _backendHttpClient: BackendHttpClient, private _zipcClient: ZipcClientService) {
  }

  ngOnDestroy(): void {
    if(this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  initSession() {
    this._asyncLoadedLessonController = this._backendHttpClient.startLesson().then((response) => {
      this._refreshTimer = setInterval(() => this.refreshLessonStatus(), 5000);
      return this._zipcClient.zipcClient.bindMoniker<LessonControllerInterface>(response.moniker);
    })
  }

  getLessonController(): Promise<LessonControllerInterface> {
    return this._asyncLoadedLessonController;
  }

  get lessonStatus(): LessonStatus | null {
    return this._lessonStatus;
  }

  async refreshLessonStatus() {
    const lessonController = await this.getLessonController();
    this._lessonStatus = await lessonController.getLessonStatus();
  }
}
