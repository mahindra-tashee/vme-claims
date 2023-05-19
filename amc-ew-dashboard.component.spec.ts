import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmcEwDashboardComponent } from './amc-ew-dashboard.component';

describe('AmcEwDashboardComponent', () => {
  let component: AmcEwDashboardComponent;
  let fixture: ComponentFixture<AmcEwDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmcEwDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmcEwDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
