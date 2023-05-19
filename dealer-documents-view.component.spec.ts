import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerDocumentsViewComponent } from './dealer-documents-view.component';

describe('DealerDocumentsViewComponent', () => {
  let component: DealerDocumentsViewComponent;
  let fixture: ComponentFixture<DealerDocumentsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealerDocumentsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DealerDocumentsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
