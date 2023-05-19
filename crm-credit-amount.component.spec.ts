import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmCreditAmountComponent } from './crm-credit-amount.component';

describe('CrmCreditAmountComponent', () => {
  let component: CrmCreditAmountComponent;
  let fixture: ComponentFixture<CrmCreditAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmCreditAmountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmCreditAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
