import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Reset Password</h3>
            </div>
            <div class="card-body">
              <div *ngIf="validating" class="text-center">
                <div class="spinner-border text-primary"></div>
                <p>Validating token...</p>
              </div>
              
              <div *ngIf="invalidToken" class="alert alert-danger">
                Invalid or expired reset token. Please request a new one.
                <a routerLink="/account/forgot-password" class="btn btn-link">Request New Link</a>
              </div>
              
              <div *ngIf="validToken && !validating">
                <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>
                <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
                
                <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label class="form-label">New Password</label>
                    <input type="password" formControlName="password" class="form-control"
                           [class.is-invalid]="resetForm.get('password')?.invalid && resetForm.get('password')?.touched">
                    <div class="invalid-feedback">Password must be at least 6 characters</div>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Confirm Password</label>
                    <input type="password" formControlName="confirmPassword" class="form-control"
                           [class.is-invalid]="resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched">
                    <div class="invalid-feedback">Passwords must match</div>
                  </div>
                  
                  <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Reset Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  validating = true;
  validToken = false;
  invalidToken = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.validating = false;
      this.invalidToken = true;
      return;
    }

    this.authService.validateResetToken(this.token).subscribe({
      next: () => {
        this.validating = false;
        this.validToken = true;
      },
      error: () => {
        this.validating = false;
        this.invalidToken = true;
      }
    });
  }

  onSubmit() {
    if (this.resetForm.invalid) return;
    
    this.loading = true;
    this.authService.resetPassword(this.token, this.resetForm.value.password).subscribe({
      next: () => {
        this.successMessage = 'Password reset successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/account/login']), 3000);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Reset failed';
        this.loading = false;
      }
    });
  }
}