import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  twoFactorForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl: string = '/';
  showTwoFactor = false;
  tempUserId: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Check if already logged in
    if (this.authService.currentUserValue) {
      console.log('User already logged in, redirecting to:', this.returnUrl);
      this.router.navigate([this.returnUrl]);
      return;
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.twoFactorForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // Subscribe to auth changes
    this.subscription.add(
      this.authService.currentUser.subscribe(user => {
        if (user) {
          console.log('Auth state changed - user logged in, redirecting');
          this.router.navigate([this.returnUrl]);
        }
      })
    );

    // Check for success message from registration
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { message?: string };
    if (state?.message) {
      this.successMessage = state.message;
      setTimeout(() => this.successMessage = '', 5000);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get f() { 
    return this.loginForm.controls; 
  }

  get tf() {
    return this.twoFactorForm.controls;
  }

  onSubmit(): void {
    // Don't submit if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    if (this.loading) {
      return;
    }

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    const rememberMe = this.f['rememberMe'].value;

    this.authService.login(email, password, rememberMe).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        this.loading = false;
        
        if (response && response.account) {
          this.errorMessage = '';
          this.successMessage = 'Login successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 500);
        } else if (response && response.requiresTwoFactor) {
          this.showTwoFactor = true;
          this.tempUserId = response.userId;
          this.alertService.info('Please enter your 2FA code from Google Authenticator');
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Your email is not verified. Please check your inbox for the verification link.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
      }
    });
  }

  verifyTwoFactor(): void {
    if (this.twoFactorForm.invalid) {
      this.errorMessage = 'Please enter a valid 6-digit code';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const code = this.tf['code'].value;

    this.authService.completeTwoFactorLogin(this.tempUserId, code).subscribe({
      next: (user) => {
        console.log('2FA verification successful:', user);
        this.errorMessage = '';
        this.successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 500);
      },
      error: (error) => {
        console.error('2FA verification error:', error);
        this.loading = false;
        
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Invalid 2FA code. Please try again.';
        }
      }
    });
  }

  backToLogin() {
    this.showTwoFactor = false;
    this.twoFactorForm.reset();
    this.errorMessage = '';
  }
}