import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimApproverDocumentsComponent } from './group-claim-approver-documents.component';

describe('GroupClaimApproverDocumentsComponent', () => {
  let component: GroupClaimApproverDocumentsComponent;
  let fixture: ComponentFixture<GroupClaimApproverDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimApproverDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimApproverDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
