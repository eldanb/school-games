import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TerminalMessage } from 'school-games-common';
import { TerminalGamesRegistry } from 'src/app/games/TerminalGamesRegistry';
import { LessonTerminalProviderService } from 'src/game-components-module/lesson-terminal-provider/lesson-terminal-provider.service';
import { TerminalUiFrameworkIntegrationSupportService } from '../terminal-main-page/terminal-main-page.component';

@Component({
  selector: 'app-terminal-game-component-host',
  templateUrl: './terminal-game-component-host.component.html',
  styleUrls: ['./terminal-game-component-host.component.scss']
})
export class TerminalGameComponentHostComponent implements OnInit, OnDestroy {
  private _lessonTerminalProviderSubscription: Subscription;

  @ViewChild('componentHost', { read: ViewContainerRef })
  private _vcr: ViewContainerRef;

  constructor(private _lessonTerminalProviderService: LessonTerminalProviderService,
    private _uiFramework: TerminalUiFrameworkIntegrationSupportService) { }


  private _handleTerminalMessage(message: TerminalMessage): void {
    if(message.type == 'start-game') {
      this.reloadGameState();
    }
  }

  reloadGameState() {
    this._vcr.clear();

    const gt = this._lessonTerminalProviderService.currentGameType;
    if(!gt) {
      return;
    }

    const gameDescriptor = TerminalGamesRegistry[gt];

    this._vcr.createComponent(gameDescriptor.rootComponent);
    this._uiFramework.pageTitle = gameDescriptor.gameTitle;

  }

  ngOnInit(): void {
    this._lessonTerminalProviderSubscription = this._lessonTerminalProviderService.onTerminalMessage.subscribe((message) => this._handleTerminalMessage(message));
  }

  ngOnDestroy(): void {
    this._lessonTerminalProviderSubscription.unsubscribe();
  }
}
