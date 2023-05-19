import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancierChassisDetailsUploadComponent } from './financier-chassis-details-upload.component';

describe('FinancierChassisDetailsUploadComponent', () => {
  let component: FinancierChassisDetailsUploadComponent;
  let fixture: ComponentFixture<FinancierChassisDetailsUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancierChassisDetailsUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancierChassisDetailsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
