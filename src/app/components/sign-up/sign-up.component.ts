import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { PasswordStrengthService } from 'src/app/services/password-strength-service.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  // Variables
  showPassword = false;
  showConfirmPassword = false;
  signUpForm!: FormGroup;
  passwordStrength: { score: number; feedback: string } = { score: 0, feedback: '' };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private passwordStrengthService: PasswordStrengthService
  ) { }

  /**
   * ngOnInIt
   */
  ngOnInit() {
    this.initForm();
    this.loadGoogleSignInScript();
  }

  /**
   * Initializes the sign up form with validators
   */
  initForm() {
    this.signUpForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Subscribe to password changes to check strength
    this.signUpForm.get('password')?.valueChanges.subscribe(
      (password: string) => {
        this.passwordStrength = this.passwordStrengthService.checkStrength(password);
      }
    );
  }

  /**
   * Loads the Google Sign-In script
   */
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

  /**
   * Handles Google Sign-In response
   */
  handleGoogleSignIn(response: any) {
    this.loaderService.show();
    this.authService.googleSignUp(response.credential).subscribe(
      (response: any) => {
        this.loaderService.hide();
        console.log('Google sign-up successful', response);
        // this.router.navigate(['/dashboard']);
      },
      (error: any) => {
        this.loaderService.hide();
        console.error('Google sign-up failed', error);
      }
    );
  }
  

  /**
   * Custom validator to check if password and conf.irm password match
   */
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  /**
   * Toggles the visibility of the password field
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles the visibility of the confirm password field
   */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Handles form submission
   */
  onSubmit() {
    if (this.signUpForm.valid) {
      this.loaderService.show();
      this.authService.signup(this.signUpForm.value).subscribe(
        response => {
          this.loaderService.hide();
          console.log('Sign Up successful', response);
          this.router.navigate(['/login']);
        },
        error => {
          this.loaderService.hide();
          console.error('Sign Up failed', error);
          if (error.error && error.error.message) {
            this.toastService.showError(error.error.message);
          } else {
            this.toastService.showError('Sign Up failed. Please try again.');
          }
        }
      );
    } else {
      Object.values(this.signUpForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  /**
   * Getter for firstName form control
   */
  get firstNameControl() { return this.signUpForm.get('firstName'); }

  /**
   * Getter for lastName form control
   */
  get lastNameControl() { return this.signUpForm.get('lastName'); }

  /**
    * Getter for username form control
    */
  get usernameControl() { return this.signUpForm.get('username'); }

  /**
   * Getter for email form control
   */
  get emailControl() { return this.signUpForm.get('email'); }

  /**
   * Getter for password form control
   */
  get passwordControl() { return this.signUpForm.get('password'); }

  /**
   * Getter for confirmPassword form control
   */
  get confirmPasswordControl() { return this.signUpForm.get('confirmPassword'); }
}