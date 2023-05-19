import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsBlockingComponent } from './claims-blocking.component';

describe('ClaimsBlockingComponent', () => {
  let component: ClaimsBlockingComponent;
  let fixture: ComponentFixture<ClaimsBlockingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimsBlockingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimsBlockingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
