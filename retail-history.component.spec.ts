import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailHistoryComponent } from './retail-history.component';

describe('RetailHistoryComponent', () => {
  let component: RetailHistoryComponent;
  let fixture: ComponentFixture<RetailHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetailHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
