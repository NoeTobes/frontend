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
  filteredUsersList: User[] = [];
  loading = true;
  searchTerm = '';
  filterRole = '';
  
  selectedUsers: Set<number> = new Set();
  selectAll = false;

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
      next: (users: User[]) => {
        this.users = users;
        this.filteredUsersList = [...users];
        this.loading = false;
        this.clearSelection();
      },
      error: (error: any) => {
        this.alertService.error('Failed to load users');
        this.loading = false;
      }
    });
  }

  filterUsers() {
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
    
    this.filteredUsersList = filtered;
    this.clearSelection();
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.filterUsers();
  }

  onRoleChange(value: string) {
    this.filterRole = value;
    this.filterUsers();
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    
    if (this.selectAll) {
      this.filteredUsersList.forEach(user => this.selectedUsers.add(user.id));
    } else {
      this.selectedUsers.clear();
    }
  }

  toggleSelectUser(userId: number, event: any) {
    if (event.target.checked) {
      this.selectedUsers.add(userId);
    } else {
      this.selectedUsers.delete(userId);
      this.selectAll = false;
    }
    
    this.selectAll = this.filteredUsersList.length > 0 && 
                     this.filteredUsersList.every(user => this.selectedUsers.has(user.id));
  }

  clearSelection() {
    this.selectedUsers.clear();
    this.selectAll = false;
  }

  getSelectedCount(): number {
    return this.selectedUsers.size;
  }

  bulkDelete() {
    if (this.selectedUsers.size === 0) {
      this.alertService.warn('No users selected');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${this.selectedUsers.size} selected user(s)?`)) {
      const deletePromises = Array.from(this.selectedUsers).map(id => 
        this.authService.deleteUserByAdmin(id).toPromise()
      );
      
      Promise.all(deletePromises).then(() => {
        this.alertService.success(`${this.selectedUsers.size} user(s) deleted successfully`);
        this.loadUsers();
      }).catch(() => {
        this.alertService.error('Failed to delete some users');
        this.loadUsers();
      });
    }
  }

  bulkVerify() {
    if (this.selectedUsers.size === 0) {
      this.alertService.warn('No users selected');
      return;
    }
    
    if (confirm(`Verify ${this.selectedUsers.size} selected user(s)?`)) {
      const verifyPromises = Array.from(this.selectedUsers).map(id => 
        this.authService.updateUserByAdmin(id, { isVerified: true }).toPromise()
      );
      
      Promise.all(verifyPromises).then(() => {
        this.alertService.success(`${this.selectedUsers.size} user(s) verified successfully`);
        this.loadUsers();
      }).catch(() => {
        this.alertService.error('Failed to verify some users');
        this.loadUsers();
      });
    }
  }

  bulkMakeAdmin() {
    if (this.selectedUsers.size === 0) {
      this.alertService.warn('No users selected');
      return;
    }
    
    if (confirm(`Make ${this.selectedUsers.size} selected user(s) Admin?`)) {
      const updatePromises = Array.from(this.selectedUsers).map(id => 
        this.authService.updateUserByAdmin(id, { role: 'Admin' }).toPromise()
      );
      
      Promise.all(updatePromises).then(() => {
        this.alertService.success(`${this.selectedUsers.size} user(s) promoted to Admin`);
        this.loadUsers();
      }).catch(() => {
        this.alertService.error('Failed to update some users');
        this.loadUsers();
      });
    }
  }

  bulkMakeUser() {
    if (this.selectedUsers.size === 0) {
      this.alertService.warn('No users selected');
      return;
    }
    
    if (confirm(`Change ${this.selectedUsers.size} selected user(s) to regular User?`)) {
      const updatePromises = Array.from(this.selectedUsers).map(id => 
        this.authService.updateUserByAdmin(id, { role: 'User' }).toPromise()
      );
      
      Promise.all(updatePromises).then(() => {
        this.alertService.success(`${this.selectedUsers.size} user(s) changed to regular User`);
        this.loadUsers();
      }).catch(() => {
        this.alertService.error('Failed to update some users');
        this.loadUsers();
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.authService.deleteUserByAdmin(user.id).subscribe({
        next: () => {
          this.alertService.success('User deleted successfully');
          this.loadUsers();
        },
        error: (error: any) => {
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
      error: (error: any) => {
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
      error: (error: any) => {
        this.alertService.error('Failed to verify user');
      }
    });
  }

  formatDate(dateValue: Date | string | undefined): string {
    if (!dateValue) return 'N/A';
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  exportToCSV() {
  // Define CSV headers
  const headers = [
    'ID', 
    'Title', 
    'First Name', 
    'Last Name', 
    'Email', 
    'Role', 
    'Verified', 
    'Created At'
  ];
  
  // Prepare data rows
  const rows = this.filteredUsersList.map(user => [
    user.id,
    user.title || '',
    user.firstName,
    user.lastName,
    user.email,
    user.role,
    user.isVerified ? 'Yes' : 'No',
    this.formatDateForCSV(user.createdAt)
  ]);
  
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  // Add BOM for UTF-8 encoding (handles special characters)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  this.alertService.success(`Exported ${this.filteredUsersList.length} users to CSV`);
}

formatDateForCSV(dateValue: Date | string | undefined): string {
  if (!dateValue) return '';
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return date.toLocaleDateString('en-US');
}
}