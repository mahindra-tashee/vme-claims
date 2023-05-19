import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualConcessionCrmComponent } from './actual-concession-crm.component';

describe('ActualConcessionCrmComponent', () => {
  let component: ActualConcessionCrmComponent;
  let fixture: ComponentFixture<ActualConcessionCrmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActualConcessionCrmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualConcessionCrmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
