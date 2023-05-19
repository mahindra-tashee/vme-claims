import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancierDetailsComponent } from './financier-details.component';

describe('FinancierDetailsComponent', () => {
  let component: FinancierDetailsComponent;
  let fixture: ComponentFixture<FinancierDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancierDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancierDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
