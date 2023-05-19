import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EwDetailsViewComponent } from './ew-details-view.component';

describe('EwDetailsViewComponent', () => {
  let component: EwDetailsViewComponent;
  let fixture: ComponentFixture<EwDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EwDetailsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EwDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
