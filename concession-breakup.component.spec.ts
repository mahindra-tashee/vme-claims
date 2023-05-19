import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcessionBreakupComponent } from './concession-breakup.component';

describe('ConcessionBreakupComponent', () => {
  let component: ConcessionBreakupComponent;
  let fixture: ComponentFixture<ConcessionBreakupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcessionBreakupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcessionBreakupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
