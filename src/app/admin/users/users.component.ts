import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  searchTerm = '';
  filterRole = '';

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.alertService.error('Failed to load users');
        this.loading = false;
      }
    });
  }

  get filteredUsers(): User[] {
    let filtered = this.users;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
    
    if (this.filterRole) {
      filtered = filtered.filter(user => user.role === this.filterRole);
    }
    
    return filtered;
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.authService.deleteUserByAdmin(user.id).subscribe({
        next: () => {
          this.alertService.success('User deleted successfully');
          this.loadUsers();
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Delete failed');
        }
      });
    }
  }

  toggleRole(user: User) {
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';
    this.authService.updateUserByAdmin(user.id, { role: newRole }).subscribe({
      next: () => {
        this.alertService.success(`User role updated to ${newRole}`);
        this.loadUsers();
      },
      error: (error) => {
        this.alertService.error('Failed to update role');
      }
    });
  }

  verifyUser(user: User) {
    this.authService.updateUserByAdmin(user.id, { isVerified: true }).subscribe({
      next: () => {
        this.alertService.success('User verified successfully');
        this.loadUsers();
      },
      error: (error) => {
        this.alertService.error('Failed to verify user');
      }
    });
  }
}