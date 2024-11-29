// src/app/shared/components/confirmation-modal/confirmation-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to perform this action?';
  @Input() confirmButtonText = 'Confirm';
  @Input() cancelButtonText = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get iconClass(): string {
    switch (this.type) {
      case 'danger':
        return 'fa fa-exclamation-triangle';
      case 'warning':
        return 'fa fa-exclamation-circle';
      case 'info':
        return 'fa fa-info-circle';
      default:
        return 'fa fa-question-circle';
    }
  }

  get iconColorClass(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  }

  get confirmButtonColorClass(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}