import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChassisDetailsTabsViewComponent } from './chassis-details-tabs-view.component';

describe('ChassisDetailsTabsViewComponent', () => {
  let component: ChassisDetailsTabsViewComponent;
  let fixture: ComponentFixture<ChassisDetailsTabsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChassisDetailsTabsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChassisDetailsTabsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
