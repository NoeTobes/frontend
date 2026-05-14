import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isDarkMode: Observable<boolean>;
  currentUser: User | null = null;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.isDarkMode = this.themeService.isDarkMode$;
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    // Listen to route changes and redirect if needed
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // If user is logged in and tries to access login/register page, redirect to home
        if (this.authService.currentUserValue) {
          const restrictedRoutes = ['/account/login', '/account/register', '/account/forgot-password'];
          if (restrictedRoutes.includes(event.urlAfterRedirects)) {
            this.router.navigate(['/']);
          }
        }
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/account/login']);
  }
}