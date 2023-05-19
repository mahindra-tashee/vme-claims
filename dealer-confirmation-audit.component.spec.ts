import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerConfirmationAuditComponent } from './dealer-confirmation-audit.component';

describe('DealerConfirmationAuditComponent', () => {
  let component: DealerConfirmationAuditComponent;
  let fixture: ComponentFixture<DealerConfirmationAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealerConfirmationAuditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DealerConfirmationAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
