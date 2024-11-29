import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { TaskStatus, TaskPriority, MilestoneStatus, ProjectStatus, ProjectRole } from '../models/enums/enums';
import { ProjectDetailResponse } from '../models/ProjectDetailResponse';
import { ProjectService } from '../service/project.service';
import { AuthService } from 'src/app/services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProjectMilestoneDetail } from '../models/projectMilestone';
import { ConfirmationService } from 'src/app/shared/confirmation-modal/confirmation-modal/service/confirmation.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  animations: [
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class ProjectDetailComponent implements OnInit {
  projectId: number = 0;
  project: ProjectDetailResponse | undefined;
  activeTab: string = 'overview';
  loading: boolean = true;
  selectedStatus: MilestoneStatus | null = null;
  searchTerm: string = '';
  isFilteringMilestones: boolean = false;
  showAllMilestones: boolean = false;
  showMilestoneModal: boolean = false;
  selectedMilestone!: ProjectMilestoneDetail | null ;
  showProjectDialog = false;

  // Expose enums to template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  MilestoneStatus = MilestoneStatus;
  ProjectStatus = ProjectStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private loaderService: LoaderService,
    private toastService: ToastService,
    public authService: AuthService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = +params['id'];
      this.loadProjectDetails();
    });
  }

  loadProjectDetails() {
    this.loading = true;
    this.loaderService.show();

    this.projectService.getProjectDetails(this.projectId).subscribe({
      next: (response) => {
        this.project = response;
        this.loading = false;
        this.loaderService.hide();
      },
      error: (error : any) => {
        console.error('Error loading project details:', error);
        this.toastService.showError('Failed to load project details');
        this.loading = false;
        this.loaderService.hide();
      }
    });
  }

  getProjectStatusClass(status: ProjectStatus): string {
    const statusClasses = {
      [ProjectStatus.Planning]: 'bg-blue-100 text-blue-800',
      [ProjectStatus.Active]: 'bg-green-100 text-green-800',
      [ProjectStatus.OnHold]: 'bg-yellow-100 text-yellow-800',
      [ProjectStatus.Completed]: 'bg-purple-100 text-purple-800',
      [ProjectStatus.Cancelled]: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getTaskStatusClass(status: TaskStatus): string {
    const statusClasses = {
      [TaskStatus.Todo]: 'bg-gray-100 text-gray-800',
      [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800',
      [TaskStatus.UnderReview]: 'bg-yellow-100 text-yellow-800',
      [TaskStatus.Completed]: 'bg-green-100 text-green-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getTaskPriorityClass(priority: TaskPriority): string {
    const priorityClasses = {
      [TaskPriority.Low]: 'bg-gray-100 text-gray-800',
      [TaskPriority.Medium]: 'bg-blue-100 text-blue-800',
      [TaskPriority.High]: 'bg-orange-100 text-orange-800',
      [TaskPriority.Urgent]: 'bg-red-100 text-red-800'
    };
    return priorityClasses[priority] || 'bg-gray-100 text-gray-800';
  }

  getMilestoneStatusClass(status: MilestoneStatus): string {
    const statusClasses = {
      [MilestoneStatus.Pending]: 'bg-gray-100 text-gray-800',
      [MilestoneStatus.InProgress]: 'bg-blue-100 text-blue-800',
      [MilestoneStatus.Completed]: 'bg-green-100 text-green-800',
      [MilestoneStatus.Delayed]: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: any, type: 'task' | 'milestone' | 'project' | 'role' = 'task'): string {
    switch (type) {
      case 'task':
        return TaskStatus[status] || 'Unknown';
      case 'milestone':
        return MilestoneStatus[status] || 'Unknown';
      case 'project':
        return ProjectStatus[status] || 'Unknown';
      case 'role':
        return ProjectRole[status] || 'Unknown';
      default:
        return 'Unknown';
    }
  }

  getPriorityText(priority: TaskPriority): string {
    return TaskPriority[priority] || 'Unknown';
  }

  getCompletedTasksCount(): number {
    return this.project?.tasks?.filter(t => t.status === TaskStatus.Completed).length || 0;
  }

  getInProgressTasksCount(): number {
    return this.project?.tasks?.filter(t => t.status === TaskStatus.InProgress).length || 0;
  }

  getOverdueTasksCount(): number {
    return this.project?.tasks?.filter(t => 
      t.status !== TaskStatus.Completed && 
      new Date(t.dueDate) < new Date()
    ).length || 0;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleMilestonesModal() {
    this.showAllMilestones = !this.showAllMilestones;
  }

  getAllMilestones() {
    if (!this.project?.milestones) return [];
    
    return this.project.milestones
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  onAddTask() {
    // To be implemented
    console.log('Add task clicked');
  }

  getUpcomingMilestones(limit: number = 3) {
    if (!this.project?.milestones) return [];
    
    return this.project.milestones
      .filter(m => m.status !== MilestoneStatus.Completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, limit);
  }

  sortMilestones(by: 'date' | 'status' | 'title' = 'date') {
    if (!this.project?.milestones) return [];
    
    return [...this.project.milestones].sort((a, b) => {
      switch(by) {
        case 'date':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'status':
          return a.status - b.status;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

 filteredMilestones() {
    let milestones = this.getAllMilestones();
    
    // Filter by status if selected
    if (this.selectedStatus !== null) {
      milestones = milestones.filter(m => m.status === this.selectedStatus);
    }
    
    // Filter by search term
    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase();
      milestones = milestones.filter(m => 
        m.title.toLowerCase().includes(term) || 
        m.description.toLowerCase().includes(term)
      );
    }
    
    return milestones;
  }

  // Add method to toggle status filter
  toggleStatusFilter(status: MilestoneStatus) {
    if (this.selectedStatus === status) {
      // If clicking the same status, clear the filter
      this.selectedStatus = null;
    } else {
      // Set new status filter
      this.selectedStatus = status;
    }
  }

  // Method to check if user can create milestone
  canManageMilestone(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.project) return false;

    const userMember = this.project.members.find(m => m.userId === currentUser.id);
    return userMember?.role === ProjectRole.Admin || userMember?.role === ProjectRole.Manager;
  }

  async confirmDeleteMilestone(milestone: ProjectMilestoneDetail): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Milestone',
      message: `Are you sure you want to delete milestone "${milestone.title}"?`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      this.loaderService.show();
      this.projectService.deleteMilestone(milestone.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Milestone deleted successfully');
          this.loadProjectDetails();
          this.loaderService.hide();
        },
        error: (error: any) => {
          console.error('Error deleting milestone:', error);
          this.toastService.showError('Failed to delete milestone. Please try again.');
          this.loaderService.hide();
        }
      });
    }
  }

  openMilestoneModal(milestone?: ProjectMilestoneDetail): void {
    if (!this.canManageMilestone()) {
      this.toastService.showError('You do not have permission to manage milestones');
      return;
    }
    this.selectedMilestone = milestone || null;
    this.showMilestoneModal = true;
  }

  closeMilestoneModal(): void {
    this.showMilestoneModal = false;
    this.selectedMilestone = null;
  }

  onAction(): void {
    this.loadProjectDetails();
  }

  async onEditProject() {
    if (!this.canManageProject()) {
      this.toastService.showError('You do not have permission to edit this project');
      return;
    }
    this.showProjectDialog = true;
  }
  
  canManageProject(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.project) return false;
  
    const userMember = this.project.members.find(m => m.userId === currentUser.id);
    return userMember?.role === ProjectRole.Admin;
  }
  
  closeProjectDialog() {
    this.showProjectDialog = false;
  }

  isStatusSelected(status: MilestoneStatus): boolean {
    return this.selectedStatus === status;
  }

  clearFilters() {
    this.selectedStatus = null;
    this.searchTerm = '';
  }

  getRecentTasks(limit: number = 3) {
    if (!this.project?.tasks) return [];
    
    return this.project.tasks
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .slice(0, limit);
  }
}