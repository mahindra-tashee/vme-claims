import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDealerDetailsViewComponent } from './claim-dealer-details-view.component';

describe('ClaimDealerDetailsViewComponent', () => {
  let component: ClaimDealerDetailsViewComponent;
  let fixture: ComponentFixture<ClaimDealerDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimDealerDetailsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDealerDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
