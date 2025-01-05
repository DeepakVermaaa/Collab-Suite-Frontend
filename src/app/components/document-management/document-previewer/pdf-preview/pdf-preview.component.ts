import { Component, HostListener, Input } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { DocumentModel } from '../../models/document.models';
import { DocumentManagementService } from '../../service/document-management.service';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css']
})
export class PdfPreviewComponent {
  @Input() document!: DocumentModel;
  
  loading = true;
  error: string | null = null;
  pdfUrl: SafeResourceUrl | null = null;

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
    this.loadPdfPreview();
    this.initializeProtection();
  }

  ngOnDestroy() {
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl as unknown as string);
    }
    this.removeProtection();
  }

  private async loadPdfPreview() {
    try {
      const response = await this.documentService.previewDocument(this.document.id).toPromise();
      if (!response) throw new Error('Failed to load PDF');
      
      // Ensure we have a Blob
      const blob = response as Blob;
      if (!(blob instanceof Blob)) throw new Error('Invalid response type');
      
      // Create object URL for the PDF
      const url = URL.createObjectURL(blob);
      
      // Create URL with additional parameters to disable features
      const enhancedUrl = url + '#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&printtools=0';
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(enhancedUrl);
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.error = 'Failed to load PDF preview';
      this.toastService.showError('Failed to load PDF preview');
    } finally {
      this.loading = false;
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

  // Initialize protection measures
  private initializeProtection() {
    // Add protection class to body
    document.body.classList.add('protect-pdf');
    
    // Disable default PDF viewer shortcuts
    document.addEventListener('keydown', this.onKeyDown);
  }

  // Clean up protection measures
  private removeProtection() {
    document.body.classList.remove('protect-pdf');
    document.removeEventListener('keydown', this.onKeyDown);
  }
}
