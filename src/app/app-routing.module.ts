import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TeamChatComponent } from './components/team-chat/team-chat.component';
import { AuthGuard } from './guards/AuthGuard';
import { NoAuthGuard } from './guards/NoAuthGuard';
import { ManageProfileComponent } from './components/manage-profile/manage-profile.component';

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'sign-up', 
    component: SignUpComponent,
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'chat', component: TeamChatComponent },
      {
        path: 'profile',
        component: ManageProfileComponent
      },
      { 
        path: 'projects',
        loadChildren: () => import('./components/project/project.module').then(m => m.ProjectModule)
      }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }