import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimTabsViewComponent } from './claim-tabs-view.component';

describe('ClaimTabsViewComponent', () => {
  let component: ClaimTabsViewComponent;
  let fixture: ComponentFixture<ClaimTabsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimTabsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimTabsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
