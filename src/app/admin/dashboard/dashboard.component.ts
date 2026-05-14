import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    verifiedUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0
  };
  recentUsers: User[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        this.stats.totalUsers = users.length;
        this.stats.verifiedUsers = users.filter(u => u.isVerified).length;
        this.stats.adminUsers = users.filter(u => u.role === 'Admin').length;
        this.stats.newUsersThisMonth = users.filter(u => {
          const createdAt = u.createdAt ? new Date(u.createdAt) : null;
          return createdAt && createdAt >= firstDayOfMonth;
        }).length;
        
        this.recentUsers = users.slice(-5).reverse();
      },
      error: (error) => console.error('Error loading stats:', error)
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
}