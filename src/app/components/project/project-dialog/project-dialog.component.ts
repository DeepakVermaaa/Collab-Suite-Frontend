import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ProjectGroup } from 'src/app/models/ProjectGroup';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { ProjectStatus } from '../models/enums/enums';
import { ProjectService } from '../service/project.service';
import { ProjectDetailResponse } from '../models/ProjectDetailResponse';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-project-dialog',
  templateUrl: './project-dialog.component.html',
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
export class ProjectDialogComponent implements OnInit {
  @Input() isOpen = false;
  @Input() project?: ProjectDetailResponse;
  @Output() closeModal  = new EventEmitter<void>();
  @Output() projectAction = new EventEmitter<void>();

  projectForm!: FormGroup;
  isSubmitting = false;
  ProjectStatus = ProjectStatus;
  today = moment().format('YYYY-MM-DD');

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {
    this.initializeForm(); // Initialize the form in constructor
  }

  private initializeForm() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: [null],
      endDate: [null],
      status: [ProjectStatus.Planning]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    console.log('ngOnInit called with project:', this.project);
    this.initializeForm(); // Ensure form is initialized
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges called with changes:', changes);
    
    // If modal is opened with a project, populate the form
    if (changes['isOpen']?.currentValue && this.project && this.projectForm) {
      console.log('Populating form with project data:', this.project);
      this.projectForm.patchValue({
        name: this.project.name,
        description: this.project.description,
        status: this.project.status,
        startDate: this.project.startDate ? moment(this.project.startDate).format('YYYY-MM-DD') : null,
        endDate: this.project.endDate ? moment(this.project.endDate).format('YYYY-MM-DD') : null
      });
    }

    // Reset form when modal is closed
    if (changes['isOpen'] && !changes['isOpen'].currentValue && this.projectForm) {
      this.projectForm.reset({
        status: ProjectStatus.Planning
      });
    }
  }

  dateRangeValidator(formGroup: FormGroup) {
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      formGroup.get('endDate')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.isSubmitting = true;
      this.loaderService.show();

      const projectData = {
        name: this.projectForm.value.name,
        description: this.projectForm.value.description,
        startDate: this.projectForm.value.startDate || null,
        endDate: this.projectForm.value.endDate || null,
        status: this.projectForm.value.status
      };

      const request = this.project 
        ? this.projectService.updateProject(this.project.id, projectData)
        : this.projectService.createProject(projectData);

      request.subscribe({
        next: () => {
          this.toastService.showSuccess(
            `Project ${this.project ? 'updated' : 'created'} successfully`
          );
          this.isSubmitting = false;
          this.loaderService.hide();
          this.projectAction.emit();
          this.close();
        },
        error: (error: any) => {
          console.error('Error with project:', error);
          this.toastService.showError(
            `Failed to ${this.project ? 'update' : 'create'} project. Please try again.`
          );
          this.isSubmitting = false;
          this.loaderService.hide();
        }
      });
    } else {
      this.markFormGroupTouched(this.projectForm);
    }
  }

  close(): void {
    this.projectForm.reset({
      status: ProjectStatus.Planning
    });
    this.closeModal .emit();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get nameErrors() {
    const control = this.projectForm.get('name');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Project name is required';
      if (control.errors['minlength']) {
        return `Project name must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  get descriptionErrors() {
    const control = this.projectForm.get('description');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Project description is required';
      if (control.errors['minlength']) {
        return `Project description must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  get dateRangeError() {
    return this.projectForm.errors?.['dateRange'] ? 'End date must be after start date' : null;
  }
}