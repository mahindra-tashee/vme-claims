import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimViewTabComponent } from './group-claim-view-tab.component';

describe('GroupClaimViewTabComponent', () => {
  let component: GroupClaimViewTabComponent;
  let fixture: ComponentFixture<GroupClaimViewTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimViewTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimViewTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
