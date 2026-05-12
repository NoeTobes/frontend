import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Email Verification</h3>
            </div>
            <div class="card-body text-center">
              <div *ngIf="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Verifying...</span>
                </div>
                <p class="mt-3">Verifying your email...</p>
              </div>
              
              <div *ngIf="success" class="alert alert-success">
                ✅ {{ successMessage }}
              </div>
              
              <div *ngIf="error" class="alert alert-danger">
                ❌ {{ errorMessage }}
              </div>
              
              <div class="mt-3" *ngIf="!loading">
                <a routerLink="/account/login" class="btn btn-primary">Go to Login</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  success = false;
  error = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    
    console.log('Token from URL:', token);
    
    if (!token) {
      this.loading = false;
      this.error = true;
      this.errorMessage = 'No verification token provided.';
      return;
    }

    this.http.post('http://localhost:3000/accounts/verify-email', { token })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.success = true;
          this.successMessage = response.message || 'Email verified successfully!';
          setTimeout(() => {
            this.router.navigate(['/account/login']);
          }, 3000);
        },
        error: (error) => {
          this.loading = false;
          this.error = true;
          this.errorMessage = error.error?.message || 'Verification failed. Invalid or expired token.';
        }
      });
  }
}