import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../service/task.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { TaskPriority, TaskStatus } from '../../project/models/enums/enums';
import { debounceTime, distinctUntilChanged, finalize, forkJoin, of, Subject, switchMap } from 'rxjs';
import { UserSearchResult } from 'src/app/models/UserSearchResult';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  @ViewChild('dropZone') dropZone!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  isDragging = false;
  taskForm!: FormGroup;
  commentForm!: FormGroup;
  selectedProjectId: number | null = null;
  isSubmitting = false;
  today = new Date().toISOString().split('T')[0];
  TaskPriority = TaskPriority;
  TaskStatus = TaskStatus;
  projectMembers: any[] = [];
  taskId?: number;
  isEditMode = false;
  activeTab = 'details';
  tempComments: any[] = [];
  comments: any[] = [];
  attachments: any[] = [];
  searchTerm = new Subject<string>();
  searchResults: UserSearchResult[] = [];
  isSearching = false;
  selectedUser: UserSearchResult | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    public authService: AuthService,
    private loaderService: LoaderService,
    private userService: UserService
  ) {
    this.initializeForms();
    this.taskId = this.route.snapshot.params['id'];
    this.selectedProjectId = Number(this.route.snapshot.params['projectId'])
    this.isEditMode = !!this.taskId;
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
    const maxFileSize = 5 * 1024 * 1024; // 5MB limit
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        this.toastService.showError(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        this.toastService.showError(`${file.name} is not an allowed file type`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (this.isEditMode) {
      // Existing task - upload files immediately
      if (!this.taskId) return;

      this.loaderService.show();
      const uploadObservables = validFiles.map(file =>
        this.taskService.addAttachment(this.taskId!, file)
      );

      forkJoin(uploadObservables).subscribe({
        next: (responses) => {
          this.toastService.showSuccess(`Successfully uploaded ${responses.length} file(s)`);
          this.loadTaskDetails();
        },
        error: (error) => {
          console.error('Error uploading files:', error);
          this.toastService.showError('Error uploading files');
          this.loaderService.hide();
        },
        complete: () => {
          this.fileInput.nativeElement.value = ''; // Reset file input
        }
      });
    } else {
      // Filter out duplicate files first
      const newFiles = validFiles.filter(file => {
        const isDuplicate = this.attachments.some(att => att.fileName === file.name);
        if (isDuplicate) {
          this.toastService.showWarning(`File ${file.name} already added`);
        }
        return !isDuplicate;
      });

      // If all files were duplicates, return early
      if (newFiles.length === 0) {
        this.fileInput.nativeElement.value = ''; // Reset file input
        return;
      }

      // Process new files
      newFiles.forEach(file => {
        const tempAttachment = {
          id: `temp_${Date.now()}_${file.name}`, // temporary id that's unique
          fileName: file.name,
          fileSize: file.size,
          file: file, // store the actual file object
          isTemp: true // flag to identify temporary attachments
        };

        this.attachments.push(tempAttachment);
      });

      this.fileInput.nativeElement.value = ''; // Reset file input
      this.toastService.showSuccess(`Added ${newFiles.length} file(s)`);
    }
  }

  ngOnInit() {
    this.loaderService.show();
    if (this.isEditMode) {
      this.loadTaskDetails();
    } else {
      this.loadInitialData();
    }
  }

  private initializeForms() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(1000)],
      priority: [TaskPriority.Medium],
      status: [TaskStatus.Todo],
      dueDate: [this.today, [Validators.required]],
      assignedToId: ['', [Validators.required]],
      projectId: [this.selectedProjectId]
    });

    this.commentForm = this.fb.group({
      content: ['', [Validators.required]]
    });

    // Set up search with debounce
    this.searchTerm.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          return of([]);
        }
        this.isSearching = true;
        return this.userService.searchProjectAssignees(term, this.selectedProjectId!).pipe(
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
    this.taskForm.patchValue({ assignedToId: user.id });
    this.searchResults = [];
  }

  private loadInitialData() {
    this.taskService.getUserProjects().subscribe({
      next: (projects) => {
        this.projectMembers = projects;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading project members:', error);
        this.toastService.showError('Error loading project members');
        this.loaderService.hide();
      }
    });
  }
  private loadTaskDetails() {
    if (!this.taskId) return;

    forkJoin({
      taskDetails: this.taskService.getTaskDetails(this.taskId),
      projectMembers: this.taskService.getUserProjects()
    }).subscribe({
      next: (response) => {
        this.projectMembers = response.projectMembers;
        const task = response.taskDetails;

        // Set the selected user from the task details
        this.selectedUser = {
          id: task.assignedTo.id,
          firstName: task.assignedTo.firstName,
          lastName: task.assignedTo.lastName,
          email: task.assignedTo.email,
          displayName: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
          profilePicture: task.assignedTo.profilePicture
        };

        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: new Date(task.dueDate).toISOString().split('T')[0],
          assignedToId: task.assignedTo.id,
          projectId: task.project.id
        });

        this.comments = task.comments;
        this.attachments = task.attachments;
        this.selectedProjectId = task.project.id;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading task details:', error);
        this.toastService.showError('Error loading task details');
        this.loaderService.hide();
      }
    });
  }

  // onSubmit() {
  //   if (this.taskForm.valid) {
  //     this.isSubmitting = true;
  //     this.loaderService.show();

  //     const taskData = {
  //       ...this.taskForm.value,
  //       dueDate: new Date(this.taskForm.value.dueDate).toISOString(),
  //       projectId: Number(this.selectedProjectId)
  //     };

  //     if (this.isEditMode) {
  //       // Update existing task
  //       this.taskService.updateTask(this.taskId!, taskData).subscribe({
  //         next: (updatedTask) => {
  //           // this.toastService.showSuccess('Task updated successfully');
  //           this.router.navigate(['/dashboard/tasks']);
  //         },
  //         error: (error) => {
  //           console.error('Error updating task:', error);
  //           this.toastService.showError('Error updating task');
  //           this.isSubmitting = false;
  //           this.loaderService.hide();
  //         }
  //       });
  //     } else {
  //       // Create new task
  //       this.taskService.createTask(taskData).subscribe({
  //         next: (createdTask) => {
  //           // Get temporary attachments that need to be uploaded
  //           const tempAttachments = this.attachments
  //             .filter(att => att.isTemp && att.file)
  //             .map(att => att.file);

  //           const uploadObservables = [
  //             // Attachment observables
  //             ...tempAttachments.map(file =>
  //               this.taskService.addAttachment(createdTask.taskId, file)
  //             ),
  //             // Comment observables
  //             ...this.tempComments.map(comment =>
  //               this.taskService.addComment(createdTask.taskId, comment.content)
  //             )
  //           ];

  //           if (uploadObservables.length > 0) {
  //             forkJoin(uploadObservables).subscribe({
  //               next: () => {
  //                 // this.toastService.showSuccess('Task created with attachments and comments');
  //                 this.router.navigate(['/dashboard/tasks']);
  //               },
  //               error: (error) => {
  //                 console.error('Error uploading attachments/comments:', error);
  //                 this.toastService.showWarning(
  //                   'Task created but some attachments or comments failed to upload. You can try adding them again by editing the task.'
  //                 );
  //                 this.router.navigate(['/dashboard/tasks']);
  //               },
  //               complete: () => {
  //                 this.isSubmitting = false;
  //                 this.loaderService.hide();
  //               }
  //             });
  //           } else {
  //             this.toastService.showSuccess('Task created successfully');
  //             this.router.navigate(['/dashboard/tasks']);
  //             this.isSubmitting = false;
  //             this.loaderService.hide();
  //           }
  //         },
  //         error: (error) => {
  //           console.error('Error creating task:', error);
  //           this.toastService.showError('Error creating task');
  //           this.isSubmitting = false;
  //           this.loaderService.hide();
  //         }
  //       });
  //     }
  //   } else {
  //     // Mark all invalid fields as touched to show validation errors
  //     Object.keys(this.taskForm.controls).forEach(key => {
  //       const control = this.taskForm.get(key);
  //       if (control?.invalid) {
  //         control.markAsTouched();
  //       }
  //     });
  //     this.toastService.showError('Please fill in all required fields correctly');
  //   }
  // }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isSubmitting = true;
      this.loaderService.show();

      const taskData = {
        ...this.taskForm.value,
        dueDate: new Date(this.taskForm.value.dueDate).toISOString(),
        projectId: Number(this.selectedProjectId)
      };

      // Get temporary attachments that need to be uploaded
      const tempAttachments = this.attachments
        .filter(att => att.isTemp && att.file)
        .map(att => att.file);

      if (this.isEditMode) {
        // Update existing task
        this.taskService.updateTask(this.taskId!, taskData).subscribe({
          next: (updatedTask) => {
            const uploadObservables = [
              // Attachment observables
              ...tempAttachments.map(file =>
                this.taskService.addAttachment(this.taskId!, file)
              ),
              // Comment observables
              ...this.tempComments.map(comment =>
                this.taskService.addComment(this.taskId!, comment.content)
              )
            ];

            if (uploadObservables.length > 0) {
              forkJoin(uploadObservables).subscribe({
                next: () => {
                  this.toastService.showSuccess('Task updated successfully');
                  this.router.navigate(['/dashboard/tasks']);
                },
                error: (error) => {
                  console.error('Error uploading attachments/comments:', error);
                  this.toastService.showWarning(
                    'Task updated but some attachments or comments failed to upload. You can try adding them again by editing the task.'
                  );
                  this.router.navigate(['/dashboard/tasks']);
                },
                complete: () => {
                  this.isSubmitting = false;
                  this.loaderService.hide();
                }
              });
            } else {
              this.toastService.showSuccess('Task updated successfully');
              this.router.navigate(['/dashboard/tasks']);
              this.isSubmitting = false;
              this.loaderService.hide();
            }
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.toastService.showError('Error updating task');
            this.isSubmitting = false;
            this.loaderService.hide();
          }
        });
      } else {
        // Create new task
        this.taskService.createTask(taskData).subscribe({
          next: (createdTask) => {
            const uploadObservables = [
              // Attachment observables
              ...tempAttachments.map(file =>
                this.taskService.addAttachment(createdTask.taskId, file)
              ),
              // Comment observables
              ...this.tempComments.map(comment =>
                this.taskService.addComment(createdTask.taskId, comment.content)
              )
            ];

            if (uploadObservables.length > 0) {
              forkJoin(uploadObservables).subscribe({
                next: () => {
                  this.toastService.showSuccess('Task created successfully');
                  this.router.navigate(['/dashboard/tasks']);
                },
                error: (error) => {
                  console.error('Error uploading attachments/comments:', error);
                  this.toastService.showWarning(
                    'Task created but some attachments or comments failed to upload. You can try adding them again by editing the task.'
                  );
                  this.router.navigate(['/dashboard/tasks']);
                },
                complete: () => {
                  this.isSubmitting = false;
                  this.loaderService.hide();
                }
              });
            } else {
              this.toastService.showSuccess('Task created successfully');
              this.router.navigate(['/dashboard/tasks']);
              this.isSubmitting = false;
              this.loaderService.hide();
            }
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.toastService.showError('Error creating task');
            this.isSubmitting = false;
            this.loaderService.hide();
          }
        });
      }
    } else {
      // Mark all invalid fields as touched to show validation errors
      Object.keys(this.taskForm.controls).forEach(key => {
        const control = this.taskForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.toastService.showError('Please fill in all required fields correctly');
    }
  }

  removeFile(attachment: any) {
    if (this.isEditMode) {
      if (!this.taskId) return;

      this.loaderService.show();
      this.taskService.removeAttachment(this.taskId, attachment.id).subscribe({
        next: (response) => {
          this.attachments = this.attachments.filter(a => a.id !== attachment.id);
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error removing file:', error);
          this.loaderService.hide();
          this.toastService.showError(error.error?.Message || 'Error removing file');
        }
      });
    } else {
      // For new tasks, just remove from local array
      this.attachments = this.attachments.filter(a => a.id !== attachment.id);
    }
  }

  addComment() {
    if (this.commentForm.valid) {
      const content = this.commentForm.get('content')?.value;

      if (this.isEditMode) {
        if (!this.taskId) return;

        this.loaderService.show();
        this.taskService.addComment(this.taskId, content).subscribe({
          next: () => {
            this.commentForm.reset();
            this.loadTaskDetails();
          },
          error: (error) => {
            console.error('Error adding comment:', error);
            this.toastService.showError('Error adding comment');
            this.loaderService.hide();
          }
        });
      } else {
        // For new task - just store the content
        this.tempComments.push({ content });
        this.commentForm.reset();
      }
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Use the same handleFiles method that drag and drop uses
      this.handleFiles(Array.from(files));
    }
  }
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  cancel() {
    this.router.navigate(['/dashboard/tasks']);
  }
}