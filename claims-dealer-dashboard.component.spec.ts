import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsDealerDashboardComponent } from './claims-dealer-dashboard.component';

describe('ClaimsDealerDashboardComponent', () => {
  let component: ClaimsDealerDashboardComponent;
  let fixture: ComponentFixture<ClaimsDealerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimsDealerDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimsDealerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
