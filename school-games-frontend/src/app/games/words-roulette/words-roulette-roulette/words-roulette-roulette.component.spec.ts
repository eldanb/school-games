import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordsRouletteRouletteComponent } from './words-roulette-roulette.component';

describe('WordsRouletteRouletteComponent', () => {
  let component: WordsRouletteRouletteComponent;
  let fixture: ComponentFixture<WordsRouletteRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WordsRouletteRouletteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordsRouletteRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
