import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Forgot Password</h3>
            </div>
            <div class="card-body">
              <div *ngIf="successMessage" class="alert alert-success">
                {{ successMessage }}
              </div>
              <div *ngIf="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>
              
              <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Email Address</label>
                  <input type="email" formControlName="email" class="form-control"
                         [class.is-invalid]="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched">
                  <div class="invalid-feedback">
                    Valid email is required
                  </div>
                </div>
                
                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Send Reset Link
                </button>
                <a routerLink="/account/login" class="btn btn-link w-100 mt-2">Back to Login</a>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;
    
    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Request failed';
        this.loading = false;
      }
    });
  }
}