import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from './service/project.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';
import { Project, ProjectStatus } from './models/project.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProjectsResponse } from 'src/app/models/ProjectResponse';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit, OnDestroy {
  // Projects Data
   // Projects Data
   projects: Project[] = [];
   totalCount: number = 0;
   totalPages: number = 0;
 
   // Filters and Pagination
   filterParams: any = {
     searchQuery: '',
     status: null,  // Changed from empty string to null
     sortBy: 'created',
     sortDirection: 'desc',
     pageNumber: 1,
     pageSize: 9
   };

  // Loading State
  loading: boolean = false;

 //Subject and Subscription
  private searchSubject = new Subject<string>();
  private searchSubscription: any;

  showCreateDialog = false;
  ProjectStatus = ProjectStatus;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {
    // Setup search debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterParams.searchQuery = searchTerm;
      this.filterParams.pageNumber = 1; // Reset to first page on search
      this.loadProjects();
    });
  }

  ngOnInit() {
    this.loadProjects();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadProjects() {
    this.loading = true;
    this.loaderService.show();

    this.projectService.getProjects(this.filterParams).subscribe({
      next: (response: ProjectsResponse) => {
        this.projects = response.data;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.loading = false;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.toastService.showError('Failed to load projects. Please try again.');
        this.loading = false;
        this.loaderService.hide();
      }
    });
  }

  getStatusText(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Planning:
        return 'Planning';
      case ProjectStatus.Active:
        return 'Active';
      case ProjectStatus.OnHold:
        return 'On Hold';
      case ProjectStatus.Completed:
        return 'Completed';
      case ProjectStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Planning:
        return 'bg-blue-100 text-blue-800';
      case ProjectStatus.Active:
        return 'bg-green-100 text-green-800';
      case ProjectStatus.OnHold:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.Completed:
        return 'bg-purple-100 text-purple-800';
      case ProjectStatus.Cancelled:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Event Handlers
  onSearch() {
    this.searchSubject.next(this.filterParams.searchQuery);
  }

  onStatusChange(status: ProjectStatus | '') {
    this.filterParams.status = status;
    this.filterParams.pageNumber = 1; // Reset to first page on filter change
    this.loadProjects();
  }

  onSortChange() {
    this.filterParams.sortDirection = 
      this.filterParams.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadProjects();
  }

  onPageChange(page: number) {
    this.filterParams.pageNumber = page;
    this.loadProjects();
    // Scroll to top of projects section
    document.querySelector('.project-container')?.scrollIntoView({ behavior: 'smooth' });
  }

  getNextMilestone(project: Project) {
    if (!project.milestones?.length) return [];
    return project.milestones
      .filter(m => m.status !== 'Completed' && new Date(m.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 1);
  }

  // Navigation
  navigateToProject(projectId: number) {
    this.router.navigate(['/projects', projectId]);
  }

  openCreateProjectDialog(): void {
    this.showCreateDialog = true;
  }

  closeCreateProjectDialog(): void {
    this.showCreateDialog = false;
  }

  onProjectCreated(): void {
    this.loadProjects(); // Refresh the project list
  }
}