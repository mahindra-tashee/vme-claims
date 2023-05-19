import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimDocumentsViewComponent } from './group-claim-documents-view.component';

describe('GroupClaimDocumentsViewComponent', () => {
  let component: GroupClaimDocumentsViewComponent;
  let fixture: ComponentFixture<GroupClaimDocumentsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimDocumentsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimDocumentsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
