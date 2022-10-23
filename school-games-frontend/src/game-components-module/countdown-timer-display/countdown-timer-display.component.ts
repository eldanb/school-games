import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { duration } from 'moment';
import 'moment-duration-format';

@Component({
  selector: 'app-countdown-timer-display',
  templateUrl: './countdown-timer-display.component.html',
  styleUrls: ['./countdown-timer-display.component.scss']
})
export class CountdownTimerDisplayComponent implements OnInit, OnDestroy {

  private _intervalHandle: any;

  public timerText: string;

  @Input()
  endTime: number | null;

  @Input()
  size: string | null;

  constructor() { }

  ngOnDestroy(): void {
    if(this._intervalHandle) {
      clearInterval(this._intervalHandle);
    }
  }

  ngOnInit(): void {
    this._intervalHandle = setInterval(() => this._refreshTime(), 100);
  }

  private _refreshTime() {
    if(!this.endTime) {
      this.timerText = '';
    } else {
      const timeDiff = Math.max(this.endTime - Date.now(), 0);
      this.timerText = duration(timeDiff, 'millisecond').format('mm:ss', { trim: false });
    }
  }

  public get clockStyle() {
    const ret: any = {};

    if(this.size) {
      ret.fontSize = this.size;
    }

    return ret;
  }
}
