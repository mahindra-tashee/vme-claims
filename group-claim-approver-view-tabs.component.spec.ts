import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimApproverViewTabsComponent } from './group-claim-approver-view-tabs.component';

describe('GroupClaimApproverViewTabsComponent', () => {
  let component: GroupClaimApproverViewTabsComponent;
  let fixture: ComponentFixture<GroupClaimApproverViewTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimApproverViewTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimApproverViewTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
