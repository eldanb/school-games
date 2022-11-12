import { Component, Input, OnInit } from '@angular/core';
import { TerminalAvatar } from 'school-games-common';

export interface ScoreBoardEntry {
  terminalId: string;
  avatar: TerminalAvatar;
  username: string;

  class?: string;

  additionalFields: any[];
}

export interface ScoreBoardColumnDefinition {
  heading: string;
  width: string;
  class?: string;
}

type RankedScoreBoardEntry = {
  entry: ScoreBoardEntry;
  rank: number;
  marked: boolean;
}


@Component({
  selector: 'app-score-board-view',
  templateUrl: './score-board-view.component.html',
  styleUrls: ['./score-board-view.component.scss']
})
export class ScoreBoardViewComponent implements OnInit {

  private _storedEntries: ScoreBoardEntry[] = [];
  private _renderedEntries: RankedScoreBoardEntry[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  set entries(entries: ScoreBoardEntry[]) {
    this._storedEntries = entries;

    this._updateRenderedEntries(entries);
  }

  get entries(): ScoreBoardEntry[] {
    return this._storedEntries;
  }

  @Input()
  columns: ScoreBoardColumnDefinition[];

  get renderedEntries(): RankedScoreBoardEntry[] {
    return this._renderedEntries;
  }

  private _updateRenderedEntries(entries: ScoreBoardEntry[]) {
    // Mark all entries as non-visisted and index by terminal ID
    const renderedByTerminalId: { [tid: string]: RankedScoreBoardEntry } = {};
    this._renderedEntries.forEach((renderedEntry) => {
      renderedByTerminalId[renderedEntry.entry.terminalId] = renderedEntry;
      renderedEntry.marked = false;
    });

    // Update existing entries and add new ones;
    // mark updated / added as visited
    entries.forEach((entry, rank) => {
      let existingRendered = renderedByTerminalId[entry.terminalId];
      if(!existingRendered) {
        existingRendered = {
          entry: entry,
          rank: 0,
          marked: false
        };

        this._renderedEntries.push(existingRendered);
      }

      existingRendered.rank = rank;
      existingRendered.entry.additionalFields.splice(0, existingRendered.entry.additionalFields.length, ...entry.additionalFields);
      existingRendered.entry.class = entry.class;
      existingRendered.marked = true;
    });

    // Prune non-visited entries
    let entryIndex = 0;
    let readIndex = 0;
    while(readIndex < this._renderedEntries.length) {
      if(this._renderedEntries[readIndex].marked) {
        this._renderedEntries[entryIndex] = this._renderedEntries[readIndex];
        entryIndex++;
      }

      readIndex++;
    }

    this._renderedEntries.splice(entryIndex, this._renderedEntries.length);
  }
}
