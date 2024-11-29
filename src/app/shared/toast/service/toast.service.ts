import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { ToastComponent } from '../toast.component';

/**
 * Service responsible for dynamically creating and displaying toast notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  /**
   * Creates and displays a toast notification.
   * @param message The message to display in the toast.
   * @param type The type of toast ('error', 'success' or 'warning').
   * @private
   */
  private showToast(message: string, type: 'error' | 'success' | 'warning') {
    // Create a component reference from the component
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ToastComponent)
      .create(this.injector);

    // Attach message and type to the component
    componentRef.instance.message = message;
    componentRef.instance.type = type;

    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRef.hostView);

    // Get DOM element from component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // Append DOM element to the body
    document.body.appendChild(domElem);

    // Wait some time and remove it from the component tree and from the DOM
    setTimeout(() => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
    }, 5000);
  }

  /**
   * Displays an error toast notification.
   * @param message The error message to display.
   */
  showError(message: string) {
    this.showToast(message, 'error');
  }

  showWarning(message: string) {
    this.showToast(message, 'warning');
  }

  /**
   * Displays a success toast notification.
   * @param message The success message to display.
   */
  showSuccess(message: string) {
    this.showToast(message, 'success');
  }
}