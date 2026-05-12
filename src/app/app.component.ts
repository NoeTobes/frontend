import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { Router } from '@angular/router';

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
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/account/login']);
  }
}