import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    console.log('AuthGuard: Checking if user is logged in, token:', this.authService.getToken());
    if (this.authService.isLoggedIn()) {
      console.log('AuthGuard: User is logged in, allowing access');
      return true;
    } else {
      console.log('AuthGuard: User is not logged in, redirecting to /login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}