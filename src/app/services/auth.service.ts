import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ToastService } from '../shared/toast/service/toast.service';
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

  /**
   * Gets the full URL for a profile picture
   * @param profilePicturePath The relative path of the profile picture
   * @returns The complete URL to the profile picture
   */
  getProfilePictureUrl(profilePicturePath: string | undefined | null): string {
    if (!profilePicturePath) {
      return '/assets/images/DummyImage.png';
    }
    
    // If the path is already a full URL, return it as is
    if (profilePicturePath.startsWith('http')) {
      return profilePicturePath;
    }

    // If the path starts with a slash, remove it to avoid double slashes
    const cleanPath = profilePicturePath.startsWith('/') 
      ? profilePicturePath.slice(1) 
      : profilePicturePath;
      
    return `${environment.apiUrl}/${cleanPath}`;
  }

  getProfilePictureUrlForAnyUser(profilePicturePath: string | undefined | null): string {
    if (!profilePicturePath) {
      return '/assets/images/DummyImage.png';
    }
    
    // If the path is already a full URL, return it as is
    if (profilePicturePath.startsWith('http')) {
      return profilePicturePath;
    }

    // If the path starts with a slash, remove it to avoid double slashes
    const cleanPath = profilePicturePath.startsWith('/') 
      ? profilePicturePath.slice(1) 
      : profilePicturePath;
      
    return `${environment.apiUrl}/${cleanPath}`;
  }

  // Getting user from Storage with profile picture URL transformation
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    if (user && user.profilePicture) {
      user.profilePicture = this.getProfilePictureUrl(user.profilePicture);
    }
    return user;
  }

  /**
   * Authenticates a user with username and password
   * @param userObj Object containing user credentials
   * @returns Observable of AuthResponse
   */
  login(userObj: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, userObj).pipe(
      map(response => {
        if (response.user && response.user.profilePicture) {
          response.user.profilePicture = this.getProfilePictureUrl(response.user.profilePicture);
        }
        return response;
      }),
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/google-authenticate`, { idToken: credential, isSignUp: false })
      .pipe(
        map(response => {
          if (response.user && response.user.profilePicture) {
            response.user.profilePicture = this.getProfilePictureUrl(response.user.profilePicture);
          }
          return response;
        }),
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
   * Authenticates a user with Google credentials (for sign-up)
   * @param credential Google ID token
   * @returns Observable of the Google authentication response
   */
  googleSignUp(credential: string): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google-authenticate`, { idToken: credential, isSignUp: true })
      .pipe(
        map(response => {
          if (response.user && response.user.profilePicture) {
            response.user.profilePicture = this.getProfilePictureUrl(response.user.profilePicture);
          }
          return response;
        }),
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
   * Stores the authentication result in localStorage
   * @param authResult The authentication response containing token and user data
   */
  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.token);
    if (authResult.user && authResult.user.profilePicture) {
      authResult.user.profilePicture = this.getProfilePictureUrl(authResult.user.profilePicture);
    }
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
    if (user.profilePicture) {
      user.profilePicture = this.getProfilePictureUrl(user.profilePicture);
    }
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Updates user profile including optional profile picture
   * @param formData FormData containing profile updates
   * @returns Observable of the updated User
   */
  updateProfile(formData: FormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update-profile`, formData)
      .pipe(
        map(updatedUser => {
          if (updatedUser.profilePicture) {
            updatedUser.profilePicture = this.getProfilePictureUrl(updatedUser.profilePicture);
          }
          return updatedUser;
        }),
        tap(updatedUser => {
          // Update the stored user data
          const currentUser = this.getCurrentUser();
          const mergedUser = { ...currentUser, ...updatedUser };
          this.updateCurrentUser(mergedUser);
        }),
        catchError(error => {
          const errorMessage = error.error?.message || 'Failed to update profile';
          this.toastService.showError(errorMessage);
          return throwError(() => error);
        })
      );
  }
}