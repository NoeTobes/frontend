import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId!: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      title: ['Mr', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['User', Validators.required],
      isVerified: [false]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.loadUserData();
      }
    });
  }

  loadUserData() {
    this.loading = true;
    this.authService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          title: user.title,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        });
        if (this.isEditMode) {
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
        }
        this.loading = false;
      },
      error: (error) => {
        this.alertService.error('Failed to load user data');
        this.router.navigate(['/admin/users']);
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.userForm.value;

    if (this.isEditMode) {
      this.authService.updateUserByAdmin(this.userId, formData).subscribe({
        next: () => {
          this.alertService.success('User updated successfully');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Update failed');
          this.loading = false;
        }
      });
    } else {
      this.authService.createUser(formData).subscribe({
        next: () => {
          this.alertService.success('User created successfully');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Creation failed');
          this.loading = false;
        }
      });
    }
  }
}