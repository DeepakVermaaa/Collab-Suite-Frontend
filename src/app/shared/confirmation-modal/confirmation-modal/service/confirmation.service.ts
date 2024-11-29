import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfirmationOptions } from '../model/ConfirmationOptions';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new Subject<ConfirmationOptions>();
  private resolveRef: ((value: boolean) => void) | null = null;
  inputValue: any = null;

  confirmation$ = this.confirmationSubject.asObservable();

  confirm(options: ConfirmationOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveRef = resolve;
      this.confirmationSubject.next(options);
    });
  }

  handleResponse(confirmed: boolean, inputValue?: any) {
    this.inputValue = inputValue;
    if (this.resolveRef) {
      this.resolveRef(confirmed);
      this.resolveRef = null;
    }
  }
}