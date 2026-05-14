import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface ActivityLog {
  id: number;
  user_id: number;
  user_email: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.css']
})
export class ActivityLogsComponent implements OnInit {
  logs: ActivityLog[] = [];
  filteredLogs: ActivityLog[] = [];
  loading = true;
  searchTerm = '';
  selectedAction = '';
  actions: string[] = [];
  total = 0;
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadLogs();
    this.loadActions();
  }

  loadLogs() {
    this.loading = true;
    const token = this.authService.getToken();
    this.http.get<{logs: ActivityLog[], total: number}>(`${this.apiUrl}/api/activity-logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.logs = response.logs;
        this.filteredLogs = response.logs;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.loading = false;
      }
    });
  }

  loadActions() {
    const token = this.authService.getToken();
    this.http.get<string[]>(`${this.apiUrl}/api/activity-logs/actions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (actions) => {
        this.actions = actions;
      },
      error: (error) => console.error('Error loading actions:', error)
    });
  }

  filterLogs() {
    this.filteredLogs = this.logs.filter(log => {
      const matchesSearch = !this.searchTerm || 
        log.user_email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesAction = !this.selectedAction || log.action === this.selectedAction;
      
      return matchesSearch && matchesAction;
    });
  }

  getActionBadgeClass(action: string): string {
    const classes: {[key: string]: string} = {
      'LOGIN': 'bg-success',
      'LOGOUT': 'bg-secondary',
      'REGISTER': 'bg-primary',
      'USER_CREATED': 'bg-primary',
      'USER_UPDATED': 'bg-info',
      'USER_DELETED': 'bg-danger',
      'PROFILE_UPDATED': 'bg-warning',
      'PASSWORD_CHANGED': 'bg-dark',
      'ROLE_CHANGED': 'bg-purple',
      'EMAIL_VERIFIED': 'bg-success',
      'PASSWORD_RESET_REQUESTED': 'bg-warning',
      'PASSWORD_RESET': 'bg-success'
    };
    return classes[action] || 'bg-secondary';
  }

  refresh() {
    this.loadLogs();
  }
  formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
}