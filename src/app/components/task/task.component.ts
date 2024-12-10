import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { LoaderService } from '../../shared/loader/service/loader.service';
import { getTaskPriorityInfo, getTaskStatusInfo, TaskPriority, TaskStatus } from '../project/models/enums/enums';
import { ProjectDropdownDto } from '../team-chat/models/ProjectDropdownDto';
import { TaskService } from './service/task.service';
import { TaskFilterDto } from './model/TaskFilterDto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  projects: ProjectDropdownDto[] = [];
  selectedProjectId: number | null = null;
  // Add these to make them available in the template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  getTaskStatusInfo = getTaskStatusInfo;
  getTaskPriorityInfo = getTaskPriorityInfo;
  todoTasks: any[] = [];
  inProgressTasks: any[] = [];
  reviewTasks: any[] = [];
  completedTasks: any[] = [];

  filterParams: TaskFilterDto = {
    pageNumber: 1,
    pageSize: 10,
    searchQuery: '',
    status: null,
    priority: null,
    projectId: null,
    assignedToMe: false,
    createdByMe: false,
    sortBy: 'created',
    sortDirection: 'desc',
    dueDateFrom: null,
    dueDateTo: null
  };

  sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'created', label: 'Created Date' }
  ];


  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private toastService: ToastService,
    public authService: AuthService,
    private loaderService: LoaderService,
    private router: Router 
  ) { }

  ngOnInit() {
    // this.loaderService.show();
    this.loadProjects();
  }

  getPriorityValues(): TaskPriority[] {
    return [
        TaskPriority.Low,
        TaskPriority.Medium,
        TaskPriority.High,
        TaskPriority.Urgent
    ];
}

  togglePriorityFilter(priority: TaskPriority) {
    this.filterParams.priority = this.filterParams.priority === priority ? null : priority;
    this.loadTasks();
  }

  handleSortChange(sortBy: string) {
    if (this.filterParams.sortBy === sortBy) {
      // Toggle direction if same field
      this.filterParams.sortDirection =
        this.filterParams.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to ascending
      this.filterParams.sortBy = sortBy;
      this.filterParams.sortDirection = 'asc';
    }
    this.loadTasks();
  }

  loadProjects() {
    this.taskService.getUserProjects().subscribe(
      (projects) => {
        this.projects = projects;
        if (projects.length > 0) {
          this.selectedProjectId = projects[0].id;
          this.loadTasks();
        }
      },
      (error) => {
        console.error('Error loading projects:', error);
        this.toastService.showError("Error loading projects");
      }
    );
  }

  loadTasks() {
    if (!this.selectedProjectId) return;
    this.loaderService.show();

    this.taskService.getTasks({
      ...this.filterParams,
      projectId: this.selectedProjectId,
      view: 'kanban'
    }).subscribe({
      next: (response) => {
        this.todoTasks = response.todo;
        this.inProgressTasks = response.inProgress;
        this.reviewTasks = response.underReview;
        this.completedTasks = response.completed;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loaderService.hide();
        this.toastService.showError("Error loading tasks");
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    // Storing original arrays for potential rollback
    const previousArray = [...event.previousContainer.data];
    const currentArray = [...event.container.data];

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Perform the move
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);

      this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
        next: () => {
          // this.toastService.showSuccess('Task status updated successfully');
        },
        error: (error) => {
          console.error('Error updating task status:', error);

          // Restoring the original arrays
          event.previousContainer.data.length = 0;
          event.container.data.length = 0;
          event.previousContainer.data.push(...previousArray);
          event.container.data.push(...currentArray);

          this.toastService.showError('Failed to update task status');
        }
      });
    }
  }

  getStatusFromContainerId(containerId: string): number {
    switch (containerId) {
      case 'todo-list':
        return 0;  // TaskStatus.Todo
      case 'in-progress-list':
        return 1;  // TaskStatus.InProgress
      case 'review-list':
        return 2;  // TaskStatus.UnderReview
      case 'completed-list':
        return 3;  // TaskStatus.Completed
      default:
        return 0;  // Default to Todo
    }
  }


  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low: return 'priority-low';
      case TaskPriority.Medium: return 'priority-medium';
      case TaskPriority.High: return 'priority-high';
      default: return '';
    }
  }

  getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low: return 'arrow_downward';
      case TaskPriority.Medium: return 'remove';
      case TaskPriority.High: return 'arrow_upward';
      default: return 'remove';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  openNewTaskDialog() {
    if (!this.selectedProjectId) {
      this.toastService.showError('Please select a project first');
      return;
    }
    
    this.router.navigate([`/dashboard/tasks/create/${this.selectedProjectId}`]);
  }

  onTaskClick(task: any, event: Event) {
    // Prevent the click from triggering the drag event
    event.stopPropagation();
    this.router.navigate([`/dashboard/tasks/edit/${task.id}`]);
  }
}