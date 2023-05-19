import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimValidityExpiryComponent } from './claim-validity-expiry.component';

describe('ClaimValidityExpiryComponent', () => {
  let component: ClaimValidityExpiryComponent;
  let fixture: ComponentFixture<ClaimValidityExpiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimValidityExpiryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimValidityExpiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
