import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { AuthResponse } from '../models/AuthResponse';
import { User } from '../models/User';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/api/User`
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser = this.currentUserSubject.asObservable();


  constructor(private http: HttpClient, private toastService: ToastService) {
  }

  // Getting user from Storage
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Authenticates a user with username and password
   * @param userObj Object containing user credentials
   * @returns Observable of AuthResponse
   */
  login(userObj: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, userObj).pipe(
      tap(response => {
        this.setSession(response);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  /**
     * Registers a new user
     * @param userObj Object containing user registration data
     * @returns Observable of the registration response
     */
  signup(userObj: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userObj).pipe(
      tap(() => this.toastService.showSuccess('Registration successful! Please log in.')),
      catchError(error => {
        return throwError(error);
      })
    );
  }

   /**
   * Authenticates a user with Google credentials (for login)
   * @param credential Google ID token
   * @returns Observable of the Google authentication response
   */
   googleLogin(credential: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google-authenticate`, { idToken: credential, isSignUp: false })
      .pipe(
        tap(() => {
          // this.toastService.showSuccess('Google login successful!');
        }),
        catchError(error => {
          // this.toastService.showError('Google login failed. Please try again.');
          return throwError(error);
        })
      );
  }

  /**
   * Authenticates a user with Google credentials (for sign-up)
   * @param credential Google ID token
   * @returns Observable of the Google authentication response
   */
  googleSignUp(credential: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google-authenticate`, { idToken: credential, isSignUp: true })
      .pipe(
        tap(() => {
          // this.toastService.showSuccess('Account created successfully with Google!');
        }),
        catchError(error => {
          // this.toastService.showError('Google sign-up failed. Please try again.');
          return throwError(error);
        })
      );
  }

  /**
   * Stores the authentication result in localStorage
   * @param authResult The authentication response containing token and user data
   */
  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
  }

  /**
   * Logs out the current user by removing the token and user data from localStorage
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Checks if a user is currently logged in
   * @returns boolean indicating if a user is logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Retrieves the current authentication token
   * @returns The current token or null if not present
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** 
   * Retrieves the current user stored in the BehaviorSubject
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** 
   * Updates the current user both in local storage and the BehaviorSubject 
   */
  updateCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}