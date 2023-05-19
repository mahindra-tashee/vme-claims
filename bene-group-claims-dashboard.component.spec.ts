import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneGroupClaimsDashboardComponent } from './bene-group-claims-dashboard.component';

describe('BeneGroupClaimsDashboardComponent', () => {
  let component: BeneGroupClaimsDashboardComponent;
  let fixture: ComponentFixture<BeneGroupClaimsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeneGroupClaimsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneGroupClaimsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
