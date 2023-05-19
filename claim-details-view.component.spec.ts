import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDetailsViewComponent } from './claim-details-view.component';

describe('ClaimDetailsViewComponent', () => {
  let component: ClaimDetailsViewComponent;
  let fixture: ComponentFixture<ClaimDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimDetailsViewComponent ]
    })
    .compileComponents();
  });

  
  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
