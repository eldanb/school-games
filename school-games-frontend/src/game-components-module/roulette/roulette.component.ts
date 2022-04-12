import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-roulette',
  templateUrl: './roulette.component.html',
  styleUrls: ['./roulette.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RouletteComponent implements OnDestroy, OnChanges, AfterViewChecked {
  @Input()
  size: number = 30;

  @Input()
  spinboardPadding = 4;

  @Input()
  labelsPadding = 20;

  @Input()
  words: string[] = [];

  @Output()
  done: EventEmitter<{}> = new EventEmitter();

  @ViewChild('rouletteSvg', { read: ElementRef, static: true })
  svgElement: ElementRef<SVGSVGElement>;

  rotateTransform: SVGTransform;

  angle: number;
  speed: number;

  sectorSize: number;
  wordPullStart: number;
  wordPullEnd: number;
  wordHotSpotStart: number;
  wordHotSpotEnd: number;

  dirty: boolean;

  spinningTimer: any;

  selectedWord: string | null = null;

  constructor() {

  }

  ngOnDestroy() {
    this.stopSpinning();
  }

  ngOnChanges() {
    this.dirty = true;
  }

  ngAfterViewChecked(): void {
    if(this.dirty) {
      this.stopSpinning();

      const polarToCart = (angle: number, padding: number) =>
        [
          this.size/2 + Math.cos(angle) * ((this.size/2)-padding),
          this.size/2 + Math.sin(angle) * ((this.size/2)-padding)
        ];

      const spinboard: SVGGElement = <SVGGElement>this.svgElement.nativeElement.childNodes.item(0);
      spinboard.innerHTML = '';

      const sectorSize = 2 * Math.PI / this.words.length;
      this.words.forEach((word, wordIndex) => {
        const angle = wordIndex * sectorSize;

        const sector: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const [sectorStartX, sectorStartY] = polarToCart(angle + sectorSize/2, this.spinboardPadding);
        const [sectorEndX, sectorEndY] = polarToCart(angle - sectorSize/2, this.spinboardPadding);
        sector.setAttribute("d", [
          "M", sectorStartX, sectorStartY,
          "A", (this.size/2) - this.spinboardPadding, (this.size/2) - this.spinboardPadding,
               0, 0, 0,
               sectorEndX, sectorEndY,
          "L", this.size/2, this.size/2,
          "Z"
        ].join(" "));

        const sectorClass =
          (this.words.length % 2 && wordIndex == this.words.length-1) ?
              "sector-oddball" :
              (wordIndex % 2 ?
                "sector-odd" :
                "sector-even");

        sector.setAttribute("class", sectorClass)
        spinboard!.appendChild(sector);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const [textX, textY] = polarToCart(angle, this.labelsPadding);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("x", `${textX}`);
        text.setAttribute("y", `${textY}`);
        text.setAttribute("transform",
            `rotate(${(angle / (2*Math.PI) * 360)}, ${textX}, ${textY})`);
        text.innerHTML = word;
        spinboard!.appendChild(text);
      });

      this.rotateTransform = this.svgElement.nativeElement.createSVGTransform();
      this.rotateTransform.setRotate(0, this.size/2, this.size/2);
      spinboard!.transform.baseVal.initialize(this.rotateTransform);

      this.angle = 0;
      this.speed = 0;
      this.selectedWord = null;

      this.sectorSize = (360 / this.words.length);
      this.wordPullStart = this.sectorSize*0.3;
      this.wordPullEnd = this.sectorSize*(1-0.3);

      this.wordHotSpotStart = this.sectorSize*0.05;
      this.wordHotSpotEnd = this.sectorSize*(1-0.05);

      this.dirty = false;
    }
  }

  spin(speed: number) {
    this.selectedWord = null;

    if(this.spinningTimer) {
      clearInterval(this.spinningTimer);
      this.spinningTimer = null;
    }

    this.speed = speed;
    this.spinningTimer = window.setInterval(() => {
      let speed = this.speed;

      const sectorModulo = ((this.angle+90) % this.sectorSize);
      if((speed < 0.5) &&
          (sectorModulo < this.wordHotSpotStart || sectorModulo > this.wordHotSpotEnd)) {
        this.stopSpinning();

        const sectorNumber = Math.round((this.angle+90) / this.sectorSize - 1) % this.words.length;
        this.selectedWord = this.words[this.words.length - 1 - sectorNumber];

        this.done.emit();
        return;
      }

      if(sectorModulo < this.wordPullStart) {
          speed = speed - 0.3;
      } else
      if(sectorModulo > this.wordPullEnd) {
        speed = speed + 0.1;
      } else {
        speed = speed - 0.2;
      }

      this.speed = speed;
      this.angle += this.speed;

      this.rotateTransform.setRotate(this.angle, this.size/2, this.size/2);
    }, 20);
  }

  stopSpinning() {
    if(this.spinningTimer) {
      clearInterval(this.spinningTimer);
      this.spinningTimer = null;
      this.speed = 0;
    }
  }

  get isSpinning() {
    return this.speed != 0;
  }
}
