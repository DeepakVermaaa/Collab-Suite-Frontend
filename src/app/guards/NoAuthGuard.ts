import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../shared/toast/service/toast.service";

@Injectable({
    providedIn: 'root'
  })
  export class NoAuthGuard implements CanActivate {
    constructor(
      private authService: AuthService,
      private router: Router,
      private toastService: ToastService
    ) {}
  
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.authService.isLoggedIn()) {
        // If user is already logged in, redirect to dashboard
        this.toastService.showWarning("Already logged-in");
        this.router.navigate(['/dashboard']);
        return false;
      }
      return true;
    }
  }