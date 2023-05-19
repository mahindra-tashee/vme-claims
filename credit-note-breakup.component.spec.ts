import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNoteBreakupComponent } from './credit-note-breakup.component';

describe('CreditNoteBreakupComponent', () => {
  let component: CreditNoteBreakupComponent;
  let fixture: ComponentFixture<CreditNoteBreakupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditNoteBreakupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNoteBreakupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
