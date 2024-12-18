import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NotificationComponent } from './components/notification/notification.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { TeamChatComponent } from './components/team-chat/team-chat.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ManageProfileComponent } from './components/manage-profile/manage-profile.component';
import { ToastComponent } from './shared/toast/toast.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { ConfirmationModalComponent } from './shared/confirmation-modal/confirmation-modal/confirmation-modal.component';
import { ConfirmationContainerComponent } from './shared/confirmation-container/confirmation-container.component';
import { TaskComponent } from './components/task/task.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    ToastComponent,
    LoaderComponent,
    NavbarComponent,
    DashboardComponent,
    NotificationComponent,
    TeamChatComponent,
    ManageProfileComponent,
    ConfirmationModalComponent,
    ConfirmationContainerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }