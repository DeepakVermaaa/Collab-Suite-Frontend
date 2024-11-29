import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';

@Component({
  selector: 'app-manage-profile',
  templateUrl: './manage-profile.component.html',
  styleUrls: ['./manage-profile.component.css']
})
export class ManageProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isSubmitting = false;
  profileImageUrl: string | undefined;
  selectedFile: File | null = null;
  showCurrentPassword = false;
  showNewPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      currentPassword: ['', [Validators.required]],
      newPassword: ['']
    });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        username: this.user.username
      });
      this.profileImageUrl = this.authService.getProfilePictureUrl(this.user.profilePicture);
    }
  }

  onProfilePictureChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.showError('Profile picture must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.match(/image\/(jpeg|png|gif)/)) {
        this.toastService.showError('Only JPEG, PNG and GIF images are allowed');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  togglePasswordVisibility(field: 'current' | 'new') {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else {
      this.showNewPassword = !this.showNewPassword;
    }
  }

  getTimeSince(date: Date | undefined | null): string {
    if (!date) return 'Never';
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      this.loaderService.show();

      try {
        const formData = new FormData();
        const formValues = this.profileForm.value;
        
        // Append form fields
        Object.keys(formValues).forEach(key => {
          if (formValues[key]) {
            formData.append(key, formValues[key]);
          }
        });

        // Append profile picture if selected
        if (this.selectedFile) {
          formData.append('profilePicture', this.selectedFile);
        }

        // Update profile
        const updatedUser = await this.authService.updateProfile(formData).toPromise();
        
        if (updatedUser) {
          this.authService.updateCurrentUser(updatedUser);
          this.toastService.showSuccess('Profile updated successfully');
        }
      } catch (error: any) {
        this.toastService.showError(error.error?.message || 'Failed to update profile');
      } finally {
        this.isSubmitting = false;
        this.loaderService.hide();
      }
    } else {
      this.toastService.showError('Please fill all required fields correctly');
    }
  }
}
