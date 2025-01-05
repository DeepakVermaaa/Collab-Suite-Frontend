import { Component, HostListener, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { DocumentModel } from '../../models/document.models';
import { DocumentManagementService } from '../../service/document-management.service';

@Component({
  selector: 'app-word-preview',
  templateUrl: './word-preview.component.html',
  styleUrls: ['./word-preview.component.css']
})
export class WordPreviewComponent {
  @Input() document!: DocumentModel;

  loading = true;
  error: string | null = null;
  content: SafeHtml | null = null;

  // Zoom controls
  currentZoom = 1;
  minZoom = 0.5;
  maxZoom = 2;
  zoomStep = 0.1;

  constructor(
    private documentService: DocumentManagementService,
    private sanitizer: DomSanitizer,
    private loaderService: LoaderService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadWordDocument();
  }

  private async loadWordDocument() {
    try {
      this.loading = true;
      this.error = null;
      
      // Request HTML format specifically
      const response = await this.documentService.previewDocument(this.document.id, { 
        format: 'html' 
      }).toPromise();
      
      if (!response) {
        throw new Error('Failed to load document');
      }

      // Since we're expecting HTML content directly, we can use it
      if (typeof response === 'string') {
        this.content = this.sanitizer.bypassSecurityTrustHtml(response);
      } else {
        // If we got a blob instead of HTML, try to read it as text
        const blob = response as unknown as Blob;
        const text = await blob.text();
        this.content = this.sanitizer.bypassSecurityTrustHtml(text);
      }
    } catch (error) {
      console.error('Error loading Word document:', error);
      this.error = 'Failed to load document preview';
      this.toastService.showError('Failed to load document preview');
    } finally {
      this.loading = false;
    }
}

  // Zoom Controls
  zoomIn() {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomStep);
    }
  }

  zoomOut() {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom = Math.max(this.minZoom, this.currentZoom - this.zoomStep);
    }
  }

  // Copy Prevention
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event) {
    event.preventDefault();
  }

  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent) {
    event.preventDefault();
    return false;
  }

  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent) {
    event.preventDefault();
    return false;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    return false;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Prevent Ctrl+C, Ctrl+X, Ctrl+V
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      if (key === 'c' || key === 'x' || key === 'v') {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  @HostListener('window:load', ['$event'])
  onLoad() {
    // Disable the browser's default drag behavior
    document.addEventListener('dragstart', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
  }
}