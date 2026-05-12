import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user: User | null = null;
  loading = false;
  passwordLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    
    // Profile Edit Form
    this.profileForm = this.fb.group({
      title: [this.user?.title || 'Mr', Validators.required],
      firstName: [this.user?.firstName, Validators.required],
      lastName: [this.user?.lastName, Validators.required],
      email: [this.user?.email, [Validators.required, Validators.email]]
    });
    
    // Password Change Form
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmitProfile() {
    if (this.profileForm.invalid) return;
    
    this.loading = true;
    const updatedData = this.profileForm.value;
    
    this.authService.updateUser(this.user!.id, updatedData).subscribe({
      next: (updatedUser) => {
        this.alertService.success('Profile updated successfully! Please login again.');
        this.authService.logout();
        setTimeout(() => {
          this.router.navigate(['/account/login']);
        }, 2000);
        this.loading = false;
      },
      error: (error) => {
        this.alertService.error(error.error?.message || 'Update failed');
        this.loading = false;
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;
    
    this.passwordLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    
    this.authService.changePassword(this.user!.id, currentPassword, newPassword).subscribe({
      next: () => {
        this.alertService.success('Password changed successfully! Please login again.');
        this.authService.logout();
        setTimeout(() => {
          this.router.navigate(['/account/login']);
        }, 2000);
        this.passwordLoading = false;
      },
      error: (error) => {
        this.alertService.error(error.error?.message || 'Password change failed');
        this.passwordLoading = false;
      }
    });
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      this.authService.deleteAccount(this.user!.id).subscribe({
        next: () => {
          this.alertService.success('Account deleted successfully');
          this.authService.logout();
          this.router.navigate(['/account/register']);
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Delete failed');
        }
      });
    }
  }
}