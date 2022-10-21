import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LessonStatusTerminalInfo, WikiRaceConsoleServices, WikiRaceGameStatus, WikiRaceTerminalStatus } from 'school-games-common';
import { LessonControllerProviderService } from 'src/game-components-module/lesson-controller-provider/lesson-controller-provider.service';

@Component({
  templateUrl: './wiki-race-console-page.component.html',
  styleUrls: ['./wiki-race-console-page.component.scss']
})
export class WikiRaceConsolePageComponent implements OnInit {

  private _wikiRaceConsoleController: WikiRaceConsoleServices;
  private _refreshTimer: any;

  public terminals: LessonStatusTerminalInfo[];
  public gameStatus: WikiRaceGameStatus | null;

  constructor(private _lessonControllerProviderService: LessonControllerProviderService) { }

  ngOnInit(): void {

    this._startGame();
    this._refreshTimer = setInterval(() => this.refreshGameStatus(), 1000);
  }

  ngOnDestroy(): void {
    if(this._refreshTimer) {
      clearInterval(this._refreshTimer);
    }
  }

  terminalInfoForTid(tid: string): LessonStatusTerminalInfo | null {
    return this.terminals.find((t) => t.terminalId === tid) || null;
  }

  get rankedTerminals(): [string, WikiRaceTerminalStatus][] {
    const ret = Object.entries(this.gameStatus!.terminalStatus);
    ret.sort((a, b) => a[1].currentScore - b[1].currentScore);
    return ret;
  }

  private async refreshGameStatus() {
    const terminalController = await this._lessonControllerProviderService.getLessonController();
    this.terminals = (await terminalController.getLessonStatus()).terminalInfo;

    this.gameStatus = await this._wikiRaceConsoleController.getGameStatus();


  }


  private async _startGame() {
    const lessonControlelr = await this._lessonControllerProviderService.getLessonController();
    const result = await lessonControlelr.startGame('wiki-race');
    this._wikiRaceConsoleController = result.gameController as WikiRaceConsoleServices;
  }

/*
  private _updateGraphSimulation() {
    console.log("UPDARING");

    this._gameForceSimulation.nodes().forEach((node) => {
      if(!node.renderedNode) {
        node.renderedNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
        node.renderedNode.setAttribute('class', 'path-node')
        node.renderedNode.innerHTML = '<circle cx="0" cy="0" r="5"/>';
        this._graphNodesParent.nativeElement.appendChild(node.renderedNode);
      }

      node.renderedNode.setAttribute("transform", `translate(${node.x} ${node.y})`)
    });

    this._linksArray.forEach((link) => {
      if(!link.renderedNode) {
        link.renderedNode = document.createElementNS("http://www.w3.org/2000/svg", "path");
        link.renderedNode.setAttribute('class', 'path-link');
        link.renderedNode.setAttribute('stroke', 'red')
        this._graphNodesParent.nativeElement.appendChild(link.renderedNode);
      }

      link.renderedNode.setAttribute("d", `M ${(link.source as PathGraphNode).x} ${(link.source as PathGraphNode).y} L ${(link.target as PathGraphNode).x} ${(link.target as PathGraphNode).y}`);
    });
  }*/
}
