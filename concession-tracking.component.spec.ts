import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcessionTrackingComponent } from './concession-tracking.component';

describe('ConcessionTrackingComponent', () => {
  let component: ConcessionTrackingComponent;
  let fixture: ComponentFixture<ConcessionTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcessionTrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcessionTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
