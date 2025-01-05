import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentModel } from '../models/document.models';

@Component({
  selector: 'app-document-previewer',
  templateUrl: './document-previewer.component.html',
  styleUrls: ['./document-previewer.component.css']
})
export class DocumentPreviewerComponent {
  @Input() document!: DocumentModel;
  @Output() close = new EventEmitter<void>();

  get isTextFile() { return this.document.fileExtension === '.txt'; }
  get isPdfFile() { return this.document.fileExtension === '.pdf'; }
  get isWordFile() { return ['.doc', '.docx'].includes(this.document.fileExtension); }
  get isExcelFile() { return ['.xls', '.xlsx'].includes(this.document.fileExtension); }

  getFileIcon(): string {
    // Return appropriate icon class based on file type
    switch(this.document.fileExtension) {
      case '.pdf': return 'fas fa-file-pdf text-red-500';
      case '.doc':
      case '.docx': return 'fas fa-file-word text-blue-500';
      case '.xls':
      case '.xlsx': return 'fas fa-file-excel text-green-500';
      case '.txt': return 'fas fa-file-alt text-gray-500';
      default: return 'fas fa-file text-gray-500';
    }
  }

  getFileType(): string {
    return this.document.fileExtension.toUpperCase().replace('.', '');
  }

  onClose() {
    this.close.emit();
  }
}
