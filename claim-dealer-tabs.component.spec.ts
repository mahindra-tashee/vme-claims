import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDealerTabsComponent } from './claim-dealer-tabs.component';

describe('ClaimDealerTabsComponent', () => {
  let component: ClaimDealerTabsComponent;
  let fixture: ComponentFixture<ClaimDealerTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimDealerTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDealerTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
