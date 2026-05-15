import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { Router } from '@angular/router';

declare var bootstrap: any; // Add this

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
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

  ngAfterViewInit() {
    // Initialize dropdowns manually if needed
    if (typeof bootstrap !== 'undefined') {
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
      dropdownElementList.forEach(dropdownToggle => {
        new bootstrap.Dropdown(dropdownToggle);
      });
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    console.log('Logout clicked');
    this.authService.logout();
    this.router.navigate(['/account/login']);
  }
}