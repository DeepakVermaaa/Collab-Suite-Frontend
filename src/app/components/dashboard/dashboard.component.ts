import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isSidebarOpen = true;
  pageTitle = 'Dashboard';
  userFullName = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Subscribe to router events to update page title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    this.userFullName = this.authService.getCurrentUser()?.firstName + ' ' + 
                       this.authService.getCurrentUser()?.lastName || 'User';
    // Set initial page title
    this.updatePageTitle(this.router.url);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private updatePageTitle(url: string) {
    // Extract the last segment of the URL
    const segment = url.split('/').pop();
    
    switch(segment) {
      case 'dashboard':
        this.pageTitle = 'Dashboard';
        break;
      case 'projects':
        this.pageTitle = 'Projects';
        break;
      case 'tasks':
        this.pageTitle = 'Tasks';
        break;
      case 'documents':
        this.pageTitle = 'Documents';
        break;
      case 'chat':
        this.pageTitle = 'Team Chat';
        break;
      case 'analytics':
        this.pageTitle = 'Analytics';
        break;
      default:
        this.pageTitle = 'Dashboard';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}