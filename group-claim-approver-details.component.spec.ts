import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimApproverDetailsComponent } from './group-claim-approver-details.component';

describe('GroupClaimApproverDetailsComponent', () => {
  let component: GroupClaimApproverDetailsComponent;
  let fixture: ComponentFixture<GroupClaimApproverDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimApproverDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimApproverDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
