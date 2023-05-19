import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimDocumentsComponent } from './group-claim-documents.component';

describe('GroupClaimDocumentsComponent', () => {
  let component: GroupClaimDocumentsComponent;
  let fixture: ComponentFixture<GroupClaimDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
