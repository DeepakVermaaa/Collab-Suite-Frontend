import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPreviewerComponent } from './document-previewer.component';

describe('DocumentPreviewerComponent', () => {
  let component: DocumentPreviewerComponent;
  let fixture: ComponentFixture<DocumentPreviewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentPreviewerComponent]
    });
    fixture = TestBed.createComponent(DocumentPreviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
