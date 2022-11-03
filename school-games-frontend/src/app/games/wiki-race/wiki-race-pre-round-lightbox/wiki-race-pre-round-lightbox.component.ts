import { Component, Input, OnInit } from '@angular/core';
import { WikiRaceRound } from 'school-games-common';

@Component({
  selector: 'app-wiki-race-pre-round-lightbox',
  templateUrl: './wiki-race-pre-round-lightbox.component.html',
  styleUrls: ['./wiki-race-pre-round-lightbox.component.scss']
})
export class WikiRacePreRoundLightboxComponent implements OnInit {

  @Input()
  round: WikiRaceRound;

  @Input()
  startTime: number;

  constructor() { }

  ngOnInit(): void {
  }

}
