import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimApproverDocumentsViewComponent } from './group-claim-approver-documents-view.component';

describe('GroupClaimApproverDocumentsViewComponent', () => {
  let component: GroupClaimApproverDocumentsViewComponent;
  let fixture: ComponentFixture<GroupClaimApproverDocumentsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimApproverDocumentsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimApproverDocumentsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
