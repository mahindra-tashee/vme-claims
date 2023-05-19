import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDealerTabsViewComponent } from './claim-dealer-tabs-view.component';

describe('ClaimDealerTabsViewComponent', () => {
  let component: ClaimDealerTabsViewComponent;
  let fixture: ComponentFixture<ClaimDealerTabsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimDealerTabsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDealerTabsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
