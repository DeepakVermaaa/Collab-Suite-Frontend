// create-project-dialog.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';
import { ProjectStatus } from '../../models/project.model';
import { ProjectCreateDto } from '../../models/ProjectCreateDto';
import { ProjectService } from '../../service/project.service';
import { trigger, transition, style, animate } from '@angular/animations';
import * as moment from 'moment';

@Component({
  selector: 'app-create-project-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.css'],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' }))
      ])
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CreateProjectDialogComponent implements OnInit {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<void>();

  projectForm: FormGroup;
  isSubmitting = false;
  ProjectStatus = ProjectStatus;
  today = moment().format('YYYY-MM-DD');
  minDate = this.today;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: [this.today],
      endDate: [''],
      status: [ProjectStatus.Planning]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
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

  close(): void {
    this.projectForm.reset({
      status: ProjectStatus.Planning
    });
    this.onClose.emit();
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.isSubmitting = true;
      this.loaderService.show();

      const projectData: ProjectCreateDto = {
        name: this.projectForm.value.name,
        description: this.projectForm.value.description,
        startDate: this.projectForm.value.startDate || null,
        endDate: this.projectForm.value.endDate || null,
        status: this.projectForm.value.status
      };

      this.projectService.createProject(projectData).subscribe({
        next: () => {
          this.toastService.showSuccess('Project created successfully');
          this.isSubmitting = false;
          this.loaderService.hide();
          this.projectCreated.emit(); // Emit event to refresh project list
          this.close();
        },
        error: (error: any) => {
          console.error('Error creating project:', error);
          this.toastService.showError('Failed to create project. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched(this.projectForm);
    }
  }

  // Helper method to show validation errors
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