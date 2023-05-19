import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimDetailsViewComponent } from './group-claim-details-view.component';

describe('GroupClaimDetailsViewComponent', () => {
  let component: GroupClaimDetailsViewComponent;
  let fixture: ComponentFixture<GroupClaimDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimDetailsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
