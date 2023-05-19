import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NFADetailsViewComponent } from './nfadetails-view.component';

describe('NFADetailsViewComponent', () => {
  let component: NFADetailsViewComponent;
  let fixture: ComponentFixture<NFADetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NFADetailsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NFADetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
