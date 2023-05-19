import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimApproverTabsComponent } from './group-claim-approver-tabs.component';

describe('GroupClaimApproverTabsComponent', () => {
  let component: GroupClaimApproverTabsComponent;
  let fixture: ComponentFixture<GroupClaimApproverTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimApproverTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimApproverTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
