import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfftakeCancellationHistoryComponent } from './offtake-cancellation-history.component';

describe('OfftakeCancellationHistoryComponent', () => {
  let component: OfftakeCancellationHistoryComponent;
  let fixture: ComponentFixture<OfftakeCancellationHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfftakeCancellationHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfftakeCancellationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
