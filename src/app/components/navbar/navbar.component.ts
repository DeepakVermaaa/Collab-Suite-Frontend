// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { User } from 'src/app/models/User';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    currentUser: User | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) {}

    ngOnInit() {
        this.authService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
    }

    get userFullName(): string {
        if (this.currentUser) {
            return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
        return 'User';
    }

    //Getter method for profile picture
    getProfilePicture(): string {
        return this.authService.getProfilePictureUrl(this.currentUser?.profilePicture);
      }

    logout() {
        this.authService.logout();
        // this.toastService.showSuccess("Successfully logged out.")
        this.router.navigate(['/login']);
    }
}