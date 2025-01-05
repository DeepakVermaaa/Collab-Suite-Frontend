import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap } from 'rxjs';
import { User } from 'src/app/models/User';
import { UserSearchResult } from 'src/app/models/UserSearchResult';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ConfirmationService } from 'src/app/shared/confirmation-modal/confirmation-modal/service/confirmation.service';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { DocumentModel, DocumentPermissionLevel, DocumentVersion } from '../models/document.models';
import { DocumentManagementService } from '../service/document-management.service';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.css']
})
export class DocumentDetailsComponent implements OnInit {
  @Input() document!: DocumentModel;
  @Output() close = new EventEmitter<void>();
  @Output() documentUpdated = new EventEmitter<void>();

  // Tab Management
  activeTab: 'details' | 'versions' | 'permissions' = 'details';

  // Version Management
  versions: DocumentVersion[] = [];
  selectedFile: File | null = null;
  uploadForm: FormGroup;

  // Permission Management
  DocumentPermissionLevel = DocumentPermissionLevel;
  showAddUserDialog = false;
  selectedUserId: number | null = null;
  selectedPermissionLevel!: DocumentPermissionLevel | null;
  availableUsers: User[] = [];

  searchTerm = new Subject<string>();
  searchResults: UserSearchResult[] = [];
  isSearching = false;
  selectedUser: UserSearchResult | null = null;
  showPreviewDialog = false;
  isEditMode = false;

  readonly allowedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
  readonly maxFileSize = 100 * 1024 * 1024; // 100MB

  constructor(
    private documentService: DocumentManagementService,
    public authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
  ) {
    this.uploadForm = this.fb.group({
      comment: ['']
    });
    this.setupUserSearch();
  }

  ngOnInit() {
    this.loadDocumentDetails();
  }

  private loadDocumentDetails() {
    this.loaderService.show();
    this.documentService.getDocumentDetails(this.document.id).subscribe({
      next: (response: any) => {
        this.document = response;
        this.versions = response.versions || [];
        this.loaderService.hide()
      },
      error: (error: any) => {
        if (error.status === 403) {
          this.toastService.showError('You do not have permission to view this document');
          this.onClose();
        } else {
          this.toastService.showError('Failed to load document details');
        }
        this.loaderService.hide();
      },
    });
  }

  private setupUserSearch() {
    this.searchTerm.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          return of([]);
        }
        this.isSearching = true;
        return this.userService.searchProjectAssignees(term, this.document.project.id).pipe(
          finalize(() => {
            this.isSearching = false;
          })
        );
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.toastService.showError('Error searching for users');
        this.searchResults = [];
      }
    });
  }

  onSearchInput(event: any) {
    const term = event.target.value?.trim();
    this.searchTerm.next(term);

    if (!term) {
      this.searchResults = [];
      this.selectedUser = null;
    }
  }

  onUserSelect(user: UserSearchResult) {
    this.selectedUser = user;
    this.selectedUserId = user.id;
    this.searchResults = [];
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.validateFile(file)) {
      this.selectedFile = file;
    }
  }

  validateFile(file: File): boolean {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!this.allowedFileTypes.includes(extension)) {
      this.toastService.showError(`File type ${extension} is not allowed`);
      return false;
    }

    if (file.size > this.maxFileSize) {
      this.toastService.showError(`File size exceeds ${this.formatFileSize(this.maxFileSize)}`);
      return false;
    }

    return true;
  }

  async uploadNewVersion() {
    if (!this.selectedFile) {
      this.toastService.showError('Please select a file');
      return;
    }

    this.loaderService.show();
    const formData = {
      file: this.selectedFile,
      comment: this.uploadForm.get('comment')?.value
    };

    try {
      await this.documentService.updateDocumentVersion(this.document.id, formData).toPromise();
      this.toastService.showSuccess('New version uploaded successfully');
      this.loadDocumentDetails();
      this.documentUpdated.emit();
      this.selectedFile = null;
      this.uploadForm.reset();
    } catch (error) {
      console.error('Error uploading new version:', error);
      this.toastService.showError('Failed to upload new version');
    } finally {
      this.loaderService.hide();
    }
  }

  downloadCurrentVersion() {
    const currentVersion = this.versions.find(v => v.id === this.document.currentVersionId);
    if (currentVersion) {
      this.downloadVersion(currentVersion);
    } else {
      this.toastService.showError('Current version not found');
    }
  }

  downloadVersion(version: DocumentVersion) {
    this.loaderService.show();
    this.documentService.downloadDocument(this.document.id, version.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Use version's file extension instead of current document's extension
        link.download = `${this.document.name}_v${version.versionNumber}${version.fileExtension}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loaderService.hide();
      },
      error: (error: any) => {
        console.error('Error downloading version:', error);
        this.toastService.showError('Failed to download version');
        this.loaderService.hide();
      }
    });
  }

  updatePermission(userId: number, event: any) {
    const newLevel = parseInt(event.target.value);
    this.loaderService.show();
    this.documentService.updatePermissions(this.document.id, userId, newLevel).subscribe({
      next: () => {
        this.toastService.showSuccess('Permission updated successfully');
        this.loadDocumentDetails();
        this.loaderService.hide();
      },
      error: (error: any) => {
        console.error('Error updating permission:', error);
        this.toastService.showError('Failed to update permission');
        this.loaderService.hide();
      }
    });
  }

  addUserPermission() {
    if (!this.selectedUserId || !this.selectedPermissionLevel) return;

    this.loaderService.show();
    this.documentService.updatePermissions(
      this.document.id,
      this.selectedUserId,
      this.selectedPermissionLevel
    ).subscribe({
      next: () => {
        this.toastService.showSuccess('User access added successfully');
        this.loadDocumentDetails();
        this.closeAddUserDialog();
      },
      error: (error: any) => {
        console.error('Error adding user access:', error);
        this.toastService.showError('Failed to add user access');
      },
      complete: () => this.loaderService.hide()
    });
  }

  // UI Helpers
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  getPermissionLevelLabel(level: DocumentPermissionLevel): string {
    return DocumentPermissionLevel[level];
  }

  getCurrentUserPermissionLevel(): DocumentPermissionLevel {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return DocumentPermissionLevel.View;

    const userPermission = this.document.permissions.find(p => p.userId === currentUser.id);
    return userPermission?.permissionLevel ?? DocumentPermissionLevel.View;
  }

  async removePermission(userId: number) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Remove Access',
      message: 'Are you sure you want to remove access for this user?',
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      this.loaderService.show();
      this.documentService.removePermission(this.document.id, userId).subscribe({
        next: () => {
          this.toastService.showSuccess('User access removed successfully');
          this.loadDocumentDetails();
        },
        error: (error) => {
          console.error('Error removing permission:', error);
          this.toastService.showError('Failed to remove user access');
        },
        complete: () => this.loaderService.hide()
      });
    }
  }

  // Permission Checks
  canEdit(): boolean {
    return this.getCurrentUserPermissionLevel() >= DocumentPermissionLevel.Edit;
  }

  canDownload(): boolean {
    return this.getCurrentUserPermissionLevel() >= DocumentPermissionLevel.Download;
  }

  openDocumentViewer() {
    this.showPreviewDialog = true;
  }

  onPreviewClose() {
    this.showPreviewDialog = false;
  }

  // Dialog Controls
  openAddUserDialog() {
    this.selectedUserId = null;
    this.selectedPermissionLevel = null;
    this.showAddUserDialog = true;
  }

  closeAddUserDialog() {
    this.showAddUserDialog = false;
    this.selectedUserId = null;
    this.selectedPermissionLevel = null;
  }

  onClose() {
    this.close.emit();
  }

  // In document-details.component.ts
  onEditClick() {
    // First check if file type is editable
    if (this.isFileEditable()) {
      this.isEditMode = true;
      this.toastService.showSuccess('Entering edit mode');
    } else {
      this.toastService.showError('This file type cannot be edited directly');
    }
  }

  isFileEditable(): boolean {
    const editableTypes = ['.txt', '.doc', '.docx'];
    return editableTypes.includes(this.document.fileExtension.toLowerCase());
  }
}