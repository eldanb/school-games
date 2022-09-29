import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export type Baloon = {
  word: string;
  status: "normal" | "popped" | "wrong";
  color: string;
  position: {
      x: number;
      y: number;
  }
};


@Component({
  selector: 'app-poppable-baloons',
  templateUrl: './poppable-baloons.component.html',
  styleUrls: ['./poppable-baloons.component.scss']
})
export class PoppableBaloonsComponent implements OnInit {

  @Input()
  baloons: Baloon[];

  @Output()
  pop: EventEmitter<Baloon> = new EventEmitter<Baloon>();

  constructor() { }

  ngOnInit(): void {
  }


  handlePop(b: Baloon) {
    this.pop.emit(b);
  }
}
