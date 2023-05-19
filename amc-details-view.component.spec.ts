import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmcDetailsViewComponent } from './amc-details-view.component';

describe('AmcDetailsViewComponent', () => {
  let component: AmcDetailsViewComponent;
  let fixture: ComponentFixture<AmcDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmcDetailsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmcDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
