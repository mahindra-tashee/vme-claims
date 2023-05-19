import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimTabComponent } from './group-claim-tab.component';

describe('GroupClaimTabComponent', () => {
  let component: GroupClaimTabComponent;
  let fixture: ComponentFixture<GroupClaimTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
