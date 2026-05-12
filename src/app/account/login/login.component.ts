import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl: string = '/';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate([this.returnUrl]);
    }

    // Initialize form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Check for success message from registration
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { message?: string };
    if (state?.message) {
      this.successMessage = state.message;
    }
  }

  // Convenience getter for easy access to form fields
  get f() { 
    return this.loginForm.controls; 
  }

  onSubmit(): void {
    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    const rememberMe = this.f['rememberMe'].value;

    this.authService.login(email, password, rememberMe)
      .subscribe({
        next: (user) => {
          console.log('Login successful', user);
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Login error', error);
          
          // Handle different error messages
          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.status === 403) {
            this.errorMessage = 'Your email is not verified. Please check your inbox.';
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Login failed. Please try again later.';
          }
          
          this.loading = false;
        }
      });
  }
}