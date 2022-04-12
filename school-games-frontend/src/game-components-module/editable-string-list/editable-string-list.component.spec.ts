import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableStringListComponent } from './editable-string-list.component';

describe('EditableStringListComponent', () => {
  let component: EditableStringListComponent;
  let fixture: ComponentFixture<EditableStringListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditableStringListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditableStringListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
