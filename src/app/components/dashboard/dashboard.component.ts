import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  isSidebarOpen = true;
  pageTitle = 'Dashboard';

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}