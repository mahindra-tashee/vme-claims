import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerDocumentsComponent } from './dealer-documents.component';

describe('DealerDocumentsComponent', () => {
  let component: DealerDocumentsComponent;
  let fixture: ComponentFixture<DealerDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealerDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DealerDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
