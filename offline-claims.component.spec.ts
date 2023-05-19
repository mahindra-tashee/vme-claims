import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineClaimsComponent } from './offline-claims.component';

describe('OfflineClaimsComponent', () => {
  let component: OfflineClaimsComponent;
  let fixture: ComponentFixture<OfflineClaimsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflineClaimsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
