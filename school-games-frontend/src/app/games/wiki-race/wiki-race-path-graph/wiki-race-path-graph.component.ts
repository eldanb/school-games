import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { LessonStatusTerminalInfo, WikiRaceGameStatus } from 'school-games-common';


const TERMINAL_PATH_SIZE = 30;

type PathGraphTraverse = {
  traverseTerminal: PathGraphTerminal;
  nextNode: PathGraphNode;

  renderNode: SVGElement | null;

  marked: boolean;
}

type PathGraphNode = {
  term: string;
  ownerTerminal: PathGraphTerminal | null;
  indexInOwnerTerminal: number;

  presentTerminals: Set<string>;
  traversals: PathGraphTraverse[];

  coordinate: number;
  renderNode: SVGElement | null;

  marked: boolean;
}

type PathGraphTerminal = {
  terminalId: string;
  marked: boolean;
  coordinate: number;
  lastNodeCoordinate: number;
  color: string;

  terminalPawnRenderedNode: SVGElement | null;
  currentPathNode: PathGraphNode | null;
}

const TERMINAL_COLORS = [ 'red', 'blue' ];


@Component({
  selector: 'app-wiki-race-path-graph',
  templateUrl: './wiki-race-path-graph.component.html',
  styleUrls: ['./wiki-race-path-graph.component.scss']
})
export class WikiRacePathGraphComponent implements OnInit, AfterViewInit {

  @Input()
  public terminals: LessonStatusTerminalInfo[];

  private _gameStatus: WikiRaceGameStatus | null;

  @Input()
  public get gameStatus(): WikiRaceGameStatus | null {
    return this._gameStatus;
  }

  public set gameStatus(s: WikiRaceGameStatus | null) {
    this._gameStatus = s;
    this._updateGraph();
  }

  private _pathGraphNodes: PathGraphNode[] = [];
  private _pathGraphTerminals: PathGraphTerminal[] = [];

  @ViewChild('graphSvgNodes', { read: ElementRef })
  private _graphNodesParent: ElementRef<SVGGElement>;

  @ViewChild('graphSvgLinks', { read: ElementRef })
  private _graphLinksParent: ElementRef<SVGGElement>;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
      this._updateGraph();
  }

  private _updateGraph() {
    if(!this._gameStatus || !this.terminals || !this._graphNodesParent.nativeElement) {
      return;
    }

    this._updatePathGraphTopology();
    this._layoutGraph();
    this._updateGraphDom();
    this._pruneStaleNodes();
  }

  private _updatePathGraphTopology() {
    // Clear visit marks
    this._pathGraphNodes.forEach((pathNode) => {
      pathNode.presentTerminals.clear();
      pathNode.marked = false;
      pathNode.traversals.forEach((traversal) => traversal.marked = false)
    });

    this._pathGraphTerminals.forEach((pathTerminal) => {
      pathTerminal.marked = false;
      pathTerminal.lastNodeCoordinate = 0;
    });

    // Update chart model
    Object.entries(this.gameStatus!.terminalStatus).forEach(([terminalId, terminalStatus]) => {
      const terminalInfo = this._terminalInfoForId(terminalId);
      terminalInfo.marked = true;

      terminalStatus.termHistory?.forEach((termHistoryEntry, historyIndex, historyArray) => {
        const targetNode = this._nodeForTerm(termHistoryEntry.term, terminalInfo, historyIndex);

        if(historyIndex > 0) {
          const sourceNode = this._nodeForTerm(historyArray[historyIndex-1].term, terminalInfo, historyIndex);
          let traverse = sourceNode.traversals.find((traversal) =>
                traversal.nextNode === targetNode &&
                traversal.traverseTerminal === terminalInfo);
          if(!traverse) {
            traverse = {
              traverseTerminal: terminalInfo,
              renderNode: null,
              nextNode: targetNode,
              marked: false
            }

            sourceNode.traversals.push(traverse);
          }

          traverse.marked = true;
        }

        terminalInfo.currentPathNode = targetNode;
      });
    });
  }

  private _layoutGraph() {
    const lanesStart = -(this._pathGraphTerminals.length * TERMINAL_PATH_SIZE) / 2;
    this._pathGraphTerminals.forEach((terminal, terminalIndex) => {
      terminal.coordinate = lanesStart + terminalIndex * TERMINAL_PATH_SIZE;
    })

    this._pathGraphNodes.forEach(pathNode => {
      if(pathNode.marked) {
        pathNode.coordinate = pathNode.ownerTerminal!.lastNodeCoordinate;
        pathNode.ownerTerminal!.lastNodeCoordinate += TERMINAL_PATH_SIZE;
        pathNode.coordinate = pathNode.indexInOwnerTerminal * TERMINAL_PATH_SIZE;
      }
    });
  }

  private _updateGraphDom() {
    this._pathGraphNodes.forEach((pathNode) => {
      if(pathNode.marked) {
        pathNode.renderNode = this._createOrUpdateNodeSvgRep(pathNode.renderNode, pathNode.coordinate, pathNode.ownerTerminal!.coordinate);
      } else {
        if(pathNode.renderNode) {
          pathNode.renderNode.remove();
        }
      }

      let traverseByTarget = _.groupBy(pathNode.traversals.filter(t => t.marked), traversal => traversal.nextNode.term);
      Object.values(traverseByTarget).forEach(traversesForTarget =>
        traversesForTarget.forEach((traverse, traverseIndexWithinTarget) => {
          traverse.renderNode = this._createOrUpdateTraverseSvgRep(
            traverse.renderNode,
            pathNode.coordinate, pathNode.ownerTerminal!.coordinate,
            traverse.nextNode.coordinate, traverse.nextNode.ownerTerminal!.coordinate,
            traverse.traverseTerminal,
            traverseIndexWithinTarget, traversesForTarget.length);
      }));


      pathNode.traversals
        .filter(traversal => !traversal.marked && traversal.renderNode)
        .forEach((traverse) => traverse.renderNode?.remove());
    });

    const terminalsByPawnNode = _.groupBy(
      this._pathGraphTerminals.filter(t => t.marked && t.currentPathNode),
      (terminal) => terminal.currentPathNode!.term);

    Object.values(terminalsByPawnNode).forEach((terminalsOnNode) =>
      terminalsOnNode.forEach((terminal, terminalIndexOnNode) => {
        terminal.terminalPawnRenderedNode = this._createOrUpdateTerminalPawnSvgRep(
          terminal.terminalPawnRenderedNode,
          terminal.color,
          terminal.currentPathNode!.coordinate, terminal.currentPathNode!.ownerTerminal!.coordinate,
          terminalIndexOnNode, terminalsOnNode.length);
      })
    );

    this._pathGraphTerminals
      .filter(t => !t.marked && t.terminalPawnRenderedNode)
      .forEach(t => t.terminalPawnRenderedNode?.remove());
  }

  private _pruneStaleNodes() {
    this._pathGraphNodes = this._pathGraphNodes.filter((pathNode) => pathNode.marked);
    this._pathGraphNodes.forEach(pathNode => pathNode.traversals = pathNode.traversals.filter(t => t.marked));
  }

  private _createOrUpdateTraverseSvgRep(renderNode: SVGElement | null,
    startX: number, startY: number,
    endX: number, endY: number,
    traverseTerminal: PathGraphTerminal,
    traverseIndex: number, numTraverses: number): SVGElement | null {
      if(!renderNode) {
        renderNode = document.createElementNS("http://www.w3.org/2000/svg", "path");
        renderNode.setAttribute('class', 'path-link');
        renderNode.setAttribute('stroke', traverseTerminal.color);
        this._graphLinksParent.nativeElement.appendChild(renderNode);
      }

      renderNode.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`);
      if(numTraverses>1) {
        renderNode.setAttribute('stroke-dasharray', `5 ${(numTraverses-1)*5}`);
        renderNode.setAttribute('stroke-dashoffset', `${traverseIndex*5}`);
      } else {
        renderNode.removeAttribute('stroke-dasharray');
        renderNode.removeAttribute('stroke-dashoffset');
      }

      return renderNode;

  }

  private _createOrUpdateNodeSvgRep(existingNode: SVGElement | null, x: number, y: number) {
    if(!existingNode) {
      existingNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
      existingNode.setAttribute('class', 'path-node')
      existingNode.innerHTML = '<circle cx="0" cy="0" r="5"/>';
      this._graphNodesParent.nativeElement.appendChild(existingNode);
    }

    existingNode.setAttribute("transform", `translate(${x} ${y})`);

    return existingNode;
  }

  private _createOrUpdateTerminalPawnSvgRep(
    existingNode: SVGElement | null,
    color: string,
    x: number, y: number,
    indexInNode: number, countInNode: number): SVGElement {
      if(!existingNode) {
        existingNode = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        existingNode.setAttribute('class', 'terminal-pawn')
        existingNode.setAttribute('stroke', color);
        this._graphNodesParent.nativeElement.appendChild(existingNode);
      }

      existingNode.setAttribute('cx', `${x}`);
      existingNode.setAttribute('cy', `${y}`);
      existingNode.setAttribute('r', `${8 + 4 * indexInNode}`);

      return existingNode;
  }

  private _nodeForTerm(term: string, visitingTerminal: PathGraphTerminal, visitingTerminalStep: number) {
    let node = this._pathGraphNodes.find(pathNode => pathNode.term === term);
    if(!node) {
      node = {
        term: term,
        presentTerminals: new Set(),
        renderNode: null,
        coordinate: 0,
        ownerTerminal: null,
        indexInOwnerTerminal: 0,
        traversals: [],
        marked: false
      }

      this._pathGraphNodes.push(node);
    }

    node.marked = true;

    if(!node.ownerTerminal ||
      !this.gameStatus?.terminalStatus[node.ownerTerminal.terminalId].termHistory.find(h => h.term === term)) {
      node.ownerTerminal = visitingTerminal;
      node.indexInOwnerTerminal = visitingTerminalStep;
    }

    return node;
  }

  private _terminalInfoForId(terminalId: string) {
    let terminalInfo = this._pathGraphTerminals.find((terminal) => terminal.terminalId === terminalId);
    if(!terminalInfo) {
      terminalInfo = {
        marked: false,
        coordinate: 0,
        lastNodeCoordinate: 0,
        terminalId: terminalId,
        color: TERMINAL_COLORS[this._pathGraphTerminals.length],
        terminalPawnRenderedNode: null,
        currentPathNode: null
      };

      this._pathGraphTerminals.push(terminalInfo);
    }

    return terminalInfo;
  }


}
