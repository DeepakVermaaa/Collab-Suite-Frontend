import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService } from 'src/app/shared/confirmation-modal/confirmation-modal/service/confirmation.service';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { Project, } from '../project/models/project.model';
import { ProjectService } from '../project/service/project.service';
import { DocumentModel, DocumentFilterParams, DocumentPermissionLevel, DocumentResponse } from './models/document.models';
import { ProjectsResponse } from 'src/app/models/ProjectResponse';
import { DocumentManagementService } from './service/document-management.service';

@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.css']
})
export class DocumentManagementComponent implements OnInit, OnDestroy {
  // Variables
  currentPage = 1;
  itemsPerPage = 10;
  recentDocuments: DocumentModel[] = [];
  selectedDocument: DocumentModel | null = null;
  projects: Project[] = [];
  selectedProject: Project | null = null;

  // UI States
  showUploadDialog = false;
  showDocumentDetail = false;

  // Filters and Pagination
  filterParams: DocumentFilterParams = {
    searchQuery: '',
    fileType: '',
    pageNumber: 1,
    pageSize: 10
  };

  // Constants
  readonly DocumentPermissionLevel = DocumentPermissionLevel;
  readonly allowedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];

  // Subscriptions
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private documentManagementService: DocumentManagementService,
    private projectService: ProjectService,
    private router: Router,
    private loaderService: LoaderService,
    private toastService: ToastService,
    public authService: AuthService,
    private confirmationService: ConfirmationService
  ) {
    // Setup search debounce
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterParams.searchQuery = searchTerm;
      this.loadProjectDocuments();
    });
  }

  ngOnInit() {
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadInitialData() {
    this.loaderService.show();
    try {
      await Promise.all([
        this.loadRecentDocuments(),
        this.loadProjects()
      ]);
    } catch (error) {
      // console.error('Error loading initial data:', error);
      // this.toastService.showError('Failed to load data');
    } finally {
      this.loaderService.hide();
    }
  }

  loadRecentDocuments(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.documentManagementService.getDocuments({
        pageNumber: 1,
        pageSize: 5,
      }).subscribe({
        next: (response: DocumentResponse) => {
          this.recentDocuments = response.data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading recent documents:', error);
          this.toastService.showError('Failed to load recent documents');
          reject(error);
        }
      });
    });
  }

  loadProjects(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.projectService.getProjects({
        pageNumber: 1,
        pageSize: 100, // Adjust based on your needs
        sortBy: 'created',
        sortDirection: 'desc'
      }).subscribe({
        next: (response: ProjectsResponse) => {
          this.projects = response.data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          this.toastService.showError('Failed to load projects');
          reject(error);
        }
      });
    });
  }

  loadProjectDocuments() {
    if (!this.selectedProject) return;

    this.loaderService.show();
    this.documentManagementService.getDocuments({
      ...this.filterParams,
      projectId: this.selectedProject.id
    }).subscribe({
      next: (response: DocumentResponse) => {
        if (this.selectedProject) {
          // Create a new object with the updated documents
          this.selectedProject = {
            ...this.selectedProject,
            documents: response.data
          };
        }
      },
      error: (error) => {
        console.error('Error loading project documents:', error);
        this.toastService.showError('Failed to load project documents');
      },
      complete: () => {
        this.loaderService.hide();
      }
    });
  }


  selectProject(project: Project) {
    this.selectedProject = project;
    this.filterParams = {
      ...this.filterParams,
      projectId: project.id,
      pageNumber: 1 // Reset to first page when changing projects
    };
    this.loadProjectDocuments();
  }

  async deleteDocument(document: DocumentModel, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Document',
      message: `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      this.loaderService.show();
      this.documentManagementService.deleteDocument(document.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Document deleted successfully');
          this.loadProjectDocuments();
          this.loadRecentDocuments();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.toastService.showError('Failed to delete document');
        },
        complete: () => {
          this.loaderService.hide();
        }
      });
    }
  }

  downloadDocument(doc: DocumentModel, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.loaderService.show();
    this.documentManagementService.downloadDocument(doc.id, doc.currentVersionId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.name}${doc.fileExtension}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.toastService.showError('Failed to download document');
        this.loaderService.hide();
      }
    });
  }
  // Event Handlers
  onSearch(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onFileTypeChange(event: any) {
    this.filterParams.fileType = event.target.value;
    this.filterParams.pageNumber = 1; // Reset to first page
    this.loadProjectDocuments();
  }

  onPageChange(page: number) {
    this.filterParams.pageNumber = page;
    this.loadProjectDocuments();
  }

  // UI Helpers
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(extension: string): string {
    const icons: Record<string, string> = {
      '.pdf': 'fa-file-pdf',
      '.doc': 'fa-file-word',
      '.docx': 'fa-file-word',
      '.xls': 'fa-file-excel',
      '.xlsx': 'fa-file-excel',
      '.txt': 'fa-file-text'
    };
    return icons[extension.toLowerCase()] || 'fa-file';
  }

  // Helper method to get current user's permission level
  private getCurrentUserPermissionLevel(doc: DocumentModel): DocumentPermissionLevel {
    if (!doc?.permissions || !Array.isArray(doc.permissions)) {
      return DocumentPermissionLevel.View;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return DocumentPermissionLevel.View;
    }

    const userPermission = doc.permissions.find(p => p.userId === currentUser.id);
    return userPermission?.permissionLevel ?? DocumentPermissionLevel.View;
  }


  // Permission check methods
  canEditDocument(doc: DocumentModel): boolean {
    if (!doc) return false;
    const permissionLevel = this.getCurrentUserPermissionLevel(doc);
    return permissionLevel >= DocumentPermissionLevel.Edit;
  }

  canDeleteDocument(doc: DocumentModel): boolean {
    if (!doc) return false;
    const permissionLevel = this.getCurrentUserPermissionLevel(doc);
    return permissionLevel === DocumentPermissionLevel.Owner;
  }

  canDownloadDocument(doc: DocumentModel): boolean {
    if (!doc) return false;
    const permissionLevel = this.getCurrentUserPermissionLevel(doc);
    return permissionLevel >= DocumentPermissionLevel.Download;
  }


  // Dialog Controls
  openUploadDialog() {
    this.showUploadDialog = true;
  }

  closeUploadDialog() {
    this.showUploadDialog = false;
    this.loadProjectDocuments();
    this.loadRecentDocuments();
  }

  showDocumentDetails(document: DocumentModel) {
    if (!document) {
      this.toastService.showError('Invalid document');
      return;
    }

    const permissionLevel = this.getCurrentUserPermissionLevel(document);

    if (permissionLevel === 0) {
      this.toastService.showError('You do not have permission to view this document');
      return;
    }

    this.selectedDocument = document;
    this.showDocumentDetail = true;
  }

  closeDocumentDetails() {
    this.selectedDocument = null;
    this.showDocumentDetail = false;
  }

  onDocumentUpdated() {
    // Reload both recent documents and project documents
    this.loadRecentDocuments();
    if (this.selectedProject) {
      this.loadProjectDocuments();
    }
  }
}