import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailConcessionComponent } from './avail-concession.component';

describe('AvailConcessionComponent', () => {
  let component: AvailConcessionComponent;
  let fixture: ComponentFixture<AvailConcessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailConcessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailConcessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
