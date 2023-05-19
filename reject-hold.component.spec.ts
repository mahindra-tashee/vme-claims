import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectHoldComponent } from './reject-hold.component';

describe('RejectHoldComponent', () => {
  let component: RejectHoldComponent;
  let fixture: ComponentFixture<RejectHoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectHoldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectHoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
