import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimApproverDetailsViewComponent } from './group-claim-approver-details-view.component';

describe('GroupClaimApproverDetailsViewComponent', () => {
  let component: GroupClaimApproverDetailsViewComponent;
  let fixture: ComponentFixture<GroupClaimApproverDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimApproverDetailsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimApproverDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
