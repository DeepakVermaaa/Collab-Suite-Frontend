import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentManagementService } from '../service/document-management.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent {
  @ViewChild('dropZone') dropZone!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() projectId: number | undefined;
  @Output() close = new EventEmitter<void>();

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isDragging = false;
  allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
  maxFileSize = 100 * 1024 * 1024; // 100MB in bytes

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentManagementService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {
    this.uploadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      comment: ['']
    });
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dropZone.nativeElement.contains(event.target)) {
      this.isDragging = true;
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dropZone.nativeElement.contains(event.target)) {
      this.isDragging = false;
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (this.dropZone.nativeElement.contains(event.target)) {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleFiles(Array.from(files));
      }
    }
  }

  private handleFiles(files: File[]) {
    // Only take the first file since we're not handling multiple files
    const file = files[0];
    if (!this.validateFile(file)) {
      this.toastService.showError('Invalid file. Please check file type and size.');
      return;
    }

    this.selectedFile = file;
    if (!this.uploadForm.get('name')?.value) {
      const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
      this.uploadForm.patchValue({ name: fileName });
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  validateFile(file: File): boolean {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      this.toastService.showError(`File type ${extension} is not allowed`);
      return false;
    }
    if (file.size > this.maxFileSize) {
      this.toastService.showError(`File size exceeds ${this.formatFileSize(this.maxFileSize)}`);
      return false;
    }
    return true;
  }

  get nameErrors() {
    const control = this.uploadForm.get('name');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Document name is required';
      if (control.errors['minlength']) {
        return `Document name must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  async onSubmit() {
    if (!this.projectId) {
      this.toastService.showError('Project ID is required');
      return;
    }

    if (!this.selectedFile) {
      this.toastService.showError('Please select a file');
      return;
    }

    if (this.uploadForm.valid) {
      this.loaderService.show();
      try {
        const formData = {
          file: this.selectedFile,
          projectId: this.projectId,
          name: this.uploadForm.get('name')?.value,
          description: this.uploadForm.get('description')?.value,
          comment: this.uploadForm.get('comment')?.value
        };

        await this.documentService.uploadDocument(formData).toPromise();
        this.toastService.showSuccess('Document uploaded successfully');
        this.close.emit();
      } catch (error) {
        console.error('Error uploading document:', error);
        this.toastService.showError('Failed to upload document');
      } finally {
        this.loaderService.hide();
      }
    } else {
      Object.keys(this.uploadForm.controls).forEach(key => {
        const control = this.uploadForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.toastService.showError('Please fill in all required fields correctly');
    }
  }

  onCancel() {
    this.close.emit();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}