import { Component, HostListener, Input } from '@angular/core';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { DocumentModel } from '../../models/document.models';
import { DocumentManagementService } from '../../service/document-management.service';

@Component({
  selector: 'app-text-preview',
  templateUrl: './text-preview.component.html',
  styleUrls: ['./text-preview.component.css']
})
export class TextPreviewComponent {
  @Input() document!: DocumentModel;

  loading = true;
  error: string | null = null;
  content: string = '';

  // Zoom controls
  currentZoom = 1;
  minZoom = 0.5;
  maxZoom = 2;
  zoomStep = 0.1;

  // Line numbers
  showLineNumbers = true;
  lines: string[] = [];

  constructor(
    private documentService: DocumentManagementService,
    private loaderService: LoaderService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadTextFile();
  }

  private async loadTextFile() {
    try {
      this.loading = true;
      this.error = null;

      const response = await this.documentService.previewDocument(this.document.id).toPromise();
      if (!response) throw new Error('Failed to load document');

      // Handle the response as a Blob
      const blob = response as Blob;
      if (!(blob instanceof Blob)) throw new Error('Invalid response type');

      // Read the blob as text
      const text = await blob.text();
      this.content = text;
      
      // Split content into lines for line numbers
      this.lines = text.split('\n');

    } catch (error) {
      console.error('Error loading text file:', error);
      this.error = 'Failed to load text preview';
      this.toastService.showError('Failed to load text preview');
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

  toggleLineNumbers() {
    this.showLineNumbers = !this.showLineNumbers;
  }

  // Line number formatting
  formatLineNumber(index: number): string {
    return String(index + 1).padStart(4, ' ');
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