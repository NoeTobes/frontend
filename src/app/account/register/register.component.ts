import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      title: ['Mr', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Convenience getter for easy access to form fields
  get f() { 
    return this.registerForm.controls; 
  }

  onSubmit(): void {
    // Stop if form is invalid
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare data for API (remove confirmPassword as it's not needed by backend)
    const registerData = {
      title: this.f['title'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      acceptTerms: this.f['acceptTerms'].value
    };

    console.log('Sending registration data:', registerData);

    this.authService.register(registerData)
      .subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          this.successMessage = response.message || 'Registration successful! Please check your email for verification link.';
          
          // Clear form
          this.registerForm.reset();
          this.loading = false;
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/account/login'], { 
              state: { message: 'Registration successful! Please verify your email before logging in.' }
            });
          }, 3000);
        },
        error: (error) => {
          console.error('Registration error:', error);
          
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to backend. Make sure backend is running on port 3000';
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
          
          this.loading = false;
        }
      });
  }
}