import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
    const user = this.authService.currentUserValue;
    
    if (user && user.role === 'Admin') {
      return true;
    }
    
    this.router.navigate(['/']);
    return false;
  }
}