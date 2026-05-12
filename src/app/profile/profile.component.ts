import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../services/auth.service';
import { AlertService } from '../services/alert.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  profilePictureUrl: string | null = null;
  uploading = false;
  apiUrl = 'http://localhost:3000';
  imageVersion: number = 0;  // Add this property

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    console.log('User from service:', this.user);
    this.loadProfilePicture();
    this.loading = false;
  }

  loadProfilePicture() {
    const userData = this.authService.currentUserValue as any;
    console.log('User data for picture:', userData);
    
    if (userData && userData.profilePicture) {
      // Extract filename from path
      const filename = userData.profilePicture.split('/').pop();
      // Use the new image endpoint with version
      this.profilePictureUrl = `${this.apiUrl}/api/images/profile/${filename}?v=${this.imageVersion}`;
      console.log('Profile picture URL set to:', this.profilePictureUrl);
    } else {
      this.profilePictureUrl = null;
      console.log('No profile picture URL in user data');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.match(/image\/(jpeg|png|jpg|gif)/)) {
      this.alertService.error('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      this.alertService.error('File size must be less than 5MB');
      return;
    }
    
    this.uploading = true;
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    const token = this.authService.getToken();
    
    console.log('Uploading file:', file.name);
    
    this.http.post(`${this.apiUrl}/api/upload/profile-picture`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (response: any) => {
        console.log('Upload response:', response);
        
        if (this.user) {
          (this.user as any).profilePicture = response.profilePicture;
          localStorage.setItem('currentUser', JSON.stringify(this.user));
          this.authService.updateUserData(this.user);
        }
        
        // Increment version to force refresh
        this.imageVersion++;
        
        // Extract filename from response
        const filename = response.profilePicture.split('/').pop();
        this.profilePictureUrl = `${this.apiUrl}/api/images/profile/${filename}?v=${this.imageVersion}`;
        
        this.alertService.success('Profile picture updated successfully!');
        this.uploading = false;
      },
      error: (error) => {
        console.error('Upload error:', error);
        if (error.status === 401) {
          this.alertService.error('Session expired. Please login again.');
          this.authService.logout();
          this.router.navigate(['/account/login']);
        } else {
          this.alertService.error(error.error?.message || 'Upload failed');
        }
        this.uploading = false;
      }
    });
  }
  
  onImageError() {
    console.log('Image failed to load, falling back to initials');
    this.profilePictureUrl = null;
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