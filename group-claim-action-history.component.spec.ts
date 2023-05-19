import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimActionHistoryComponent } from './group-claim-action-history.component';

describe('GroupClaimActionHistoryComponent', () => {
  let component: GroupClaimActionHistoryComponent;
  let fixture: ComponentFixture<GroupClaimActionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupClaimActionHistoryComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimActionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
