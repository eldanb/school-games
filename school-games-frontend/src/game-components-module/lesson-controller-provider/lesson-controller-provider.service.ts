import { Injectable } from "@angular/core";
import { LessonControllerInterface, MonikerResolver } from "school-games-common";
import { BackendHttpClient } from "../backend-client/backend-http-client";
import { ZipcClientService } from "../zipc-client-service/zipc-client.service";

@Injectable()
export class LessonControllerProviderService {
  private _asyncLoadedLessonController: Promise<LessonControllerInterface>;

  constructor(private _backendHttpClient: BackendHttpClient, private _zipcClient: ZipcClientService) {
  }

  initSession() {
    this._asyncLoadedLessonController = this._backendHttpClient.startLesson().then((response) => {
      return this._zipcClient.zipcClient.bindMoniker<LessonControllerInterface>(response.moniker);
    })
  }

  getLessonController(): Promise<LessonControllerInterface> {
    return this._asyncLoadedLessonController;
  }
}
