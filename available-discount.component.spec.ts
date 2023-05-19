import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableDiscountComponent } from './available-discount.component';

describe('AvailableDiscountComponent', () => {
  let component: AvailableDiscountComponent;
  let fixture: ComponentFixture<AvailableDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailableDiscountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
