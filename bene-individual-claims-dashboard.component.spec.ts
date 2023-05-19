import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneIndividualClaimsDashboardComponent } from './bene-individual-claims-dashboard.component';

describe('BeneIndividualClaimsDashboardComponent', () => {
  let component: BeneIndividualClaimsDashboardComponent;
  let fixture: ComponentFixture<BeneIndividualClaimsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeneIndividualClaimsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneIndividualClaimsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
