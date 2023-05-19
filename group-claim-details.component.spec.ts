import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupClaimDetailsComponent } from './group-claim-details.component';

describe('GroupClaimDetailsComponent', () => {
  let component: GroupClaimDetailsComponent;
  let fixture: ComponentFixture<GroupClaimDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupClaimDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupClaimDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
