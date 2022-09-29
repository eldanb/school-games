import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameType } from 'school-games-common/dist/lesson-model/games-registry';
import { ConsoleGamesRegistry } from 'src/app/games/ConsoleGamesRegistry';
import { ConsoleUiFrameworkIntegrationSupportService } from '../console-ui-framework/console-ui-framework.component';

@Component({
  templateUrl: './console-game-page-host.component.html',
  styleUrls: ['./console-game-page-host.component.scss']
})
export class ConsoleGamePageHostComponent implements AfterViewInit, OnDestroy {
  private _currentGameId: string | null;

  @ViewChild('gamePageContainer', {read: ViewContainerRef})
  private _gamePageContainer: ViewContainerRef;

  private _routeSubscription: Subscription;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _uiFramework: ConsoleUiFrameworkIntegrationSupportService
  ) {
  }

  ngAfterViewInit(): void {
    this._routeSubscription = this._activatedRoute.params.subscribe((params) => {
      if(params['gameId'] != this._currentGameId) {
        this._loadGame(params['gameId']);
      }
    });
  }

  ngOnDestroy(): void {
      if(this._routeSubscription) {
        this._routeSubscription.unsubscribe();
      }
  }

  private _loadGame(gameId: string) {
    this._currentGameId = gameId;
    this._gamePageContainer.clear();

    if(this._currentGameId) {
      const gameDescriptor = ConsoleGamesRegistry[this._currentGameId as GameType];
      if(!gameDescriptor) {
        return;
      }

      setTimeout(() => {
        this._uiFramework.pageTitle = gameDescriptor.gameTitle;
        this._gamePageContainer.createComponent(gameDescriptor.rootComponent);
      }, 0)
    }
  }

}
