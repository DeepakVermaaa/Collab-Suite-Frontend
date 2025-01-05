import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextPreviewComponent } from './text-preview.component';

describe('TextPreviewComponent', () => {
  let component: TextPreviewComponent;
  let fixture: ComponentFixture<TextPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextPreviewComponent]
    });
    fixture = TestBed.createComponent(TextPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
