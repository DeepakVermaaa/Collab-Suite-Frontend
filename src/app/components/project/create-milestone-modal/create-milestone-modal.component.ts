import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../shared/toast/service/toast.service';
import { LoaderService } from '../../../shared/loader/service/loader.service';
import { MilestoneCreateDto } from '../models/MilestoneCreateDto';
import { ProjectService } from '../service/project.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProjectMilestoneDetail } from '../models/projectMilestone';
import { MilestoneStatus } from '../models/enums/enums';

@Component({
  selector: 'app-create-milestone-modal',
  templateUrl: './create-milestone-modal.component.html',
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
export class CreateMilestoneModalComponent implements OnInit {
  @Input() projectId!: number;
  @Input() show: boolean = false;
  @Input() milestone: ProjectMilestoneDetail | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() milestoneAction = new EventEmitter<void>();

  MilestoneStatus = MilestoneStatus;
  milestoneForm: FormGroup = this.initializeForm();
  isSubmitting: boolean = false;

  get isEditMode(): boolean {
    return !!this.milestone;
  }

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {}

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['milestone'] && this.milestone) {
      this.milestoneForm.patchValue({
        title: this.milestone.title,
        description: this.milestone.description,
        dueDate: new Date(this.milestone.dueDate).toISOString().split('T')[0],
        status: this.milestone.status
      });
    }
  }

  private initializeForm(): FormGroup {
    return this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      dueDate: ['', Validators.required],
      status: [0] // Default to Pending
    });
  }

  resetForm(): void {
    this.milestoneForm = this.initializeForm();
  }

  isPastDate(date: string): boolean {
    return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
  }

  onSubmit(): void {
    if (this.milestoneForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.loaderService.show();

      const milestoneData = {
        title: this.milestoneForm.get('title')?.value,
        description: this.milestoneForm.get('description')?.value,
        dueDate: new Date(this.milestoneForm.get('dueDate')?.value),
        status: this.milestoneForm.get('status')?.value
      };

      const request = this.isEditMode
        ? this.projectService.updateMilestone(this.milestone!.id, milestoneData)
        : this.projectService.createMilestone(this.projectId, milestoneData);

      request.subscribe({
        next: () => {
          this.toastService.showSuccess(
            this.isEditMode 
              ? 'Milestone updated successfully' 
              : 'Milestone created successfully'
          );
          this.milestoneAction.emit();
          this.close();
          this.isSubmitting = false;
          this.loaderService.hide();
        },
        error: (error: any) => {
          console.error('Error with milestone:', error);
          this.toastService.showError(
            this.isEditMode 
              ? 'Failed to update milestone' 
              : 'Failed to create milestone'
          );
          this.isSubmitting = false;
          this.loaderService.hide();
        }
      });
    }
  }

  close(): void {
    this.resetForm();
    this.closeModal.emit();
  }
}