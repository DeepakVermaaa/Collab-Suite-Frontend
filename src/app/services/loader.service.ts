import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // BehaviorSubject to track loading state
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  // Observable for components to subscribe to
  isLoading$ = this.isLoadingSubject.asObservable();

  // Set loading state to true
  show() {
    this.isLoadingSubject.next(true);
  }

  // Set loading state to false
  hide() {
    this.isLoadingSubject.next(false);
  }
}