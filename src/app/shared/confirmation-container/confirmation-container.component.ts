import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { ConfirmationOptions } from "../confirmation-modal/confirmation-modal/model/ConfirmationOptions";
import { ConfirmationService } from "../confirmation-modal/confirmation-modal/service/confirmation.service";

@Component({
  selector: 'app-confirmation-container',
  template: `
    <app-confirmation-modal
      [isOpen]="isOpen"
      [title]="options.title || 'Confirm Action'"
      [message]="options.message || 'Are you sure you want to perform this action?'"
      [confirmButtonText]="options.confirmButtonText || 'Confirm'"
      [cancelButtonText]="options.cancelButtonText || 'Cancel'"
      [type]="options.type || 'danger'"
      (confirm)="onConfirm()"
      (cancel)="onCancel()"
    ></app-confirmation-modal>
  `
})
export class ConfirmationContainerComponent implements OnInit, OnDestroy {
  isOpen = false;
  options: ConfirmationOptions = {};
  private subscription: Subscription | null = null;

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.subscription = this.confirmationService.confirmation$.subscribe(options => {
      this.options = options;
      this.isOpen = true;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onConfirm() {
    this.confirmationService.handleResponse(true);
    this.isOpen = false;
  }
  
  onCancel() {
    this.confirmationService.handleResponse(false);
    this.isOpen = false;
  }
}