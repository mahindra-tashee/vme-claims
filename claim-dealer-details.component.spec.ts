import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDealerDetailsComponent } from './claim-dealer-details.component';

describe('ClaimDealerDetailsComponent', () => {
  let component: ClaimDealerDetailsComponent;
  let fixture: ComponentFixture<ClaimDealerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimDealerDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDealerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
