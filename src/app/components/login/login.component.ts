import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  //Variables
  showPassword: boolean = false;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private loaderService: LoaderService,
  ) {}

 /**
   * on init
   */ 
  ngOnInit() {
    this.initForm();
    this.loadGoogleSignInScript();
  }

  //Initialises login form with validators
  initForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)] ]
    });
  }


  /**
   * Toggles the visibility of the password field
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles form submission
   */
  onSubmit() {
    if (this.loginForm.valid) {
      this.loaderService.show();
      this.authService.login(this.loginForm.value).subscribe(
        response => {
          this.loaderService.hide();
          console.log('Login successful', response);
          this.toastService.showSuccess('Welcome back!');
          this.router.navigate(['/dashboard']);
        },
        error => {
          this.loaderService.hide();
          console.error('Login failed', error);
          if (error.error && error.error.message) {
            this.toastService.showError(error.error.message);
          } else {
            this.toastService.showError('Login failed. Please try again.');
          }
        }
      );
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  loadGoogleSignInScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Google Sign-In
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: '998894095314-lce080tb3d9oudtovc6j26495m2ag6o9.apps.googleusercontent.com', // Replace with your Google Client ID
        callback: this.handleGoogleSignIn.bind(this)
      });
      // @ts-ignore
      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          type: 'icon',
          shape: 'circle',
          theme: 'outline',
          size: 'large',
        }
      );
    };
  }

  handleGoogleSignIn(response: any) {
    // Send the ID token to your backend
    this.authService.googleLogin(response.credential).subscribe(
      (response: any) => {
        console.log('Google login successful', response);
        // this.toastService.showSuccess('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      (error: any) => {
        console.error('Google login failed', error);
        this.toastService.showError('Google login failed. Please try again.');
      }
    );
  }


  // Getter methods for easy access in the template
  get usernameControl() { return this.loginForm.get('username'); }
  get passwordControl() { return this.loginForm.get('password'); }
}