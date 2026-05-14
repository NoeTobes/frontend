import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  title?: string;
  isVerified?: boolean;
  createdAt?: Date;
  profilePicture?: string;
  twoFactorEnabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserData(user: User): void {
    this.currentUserSubject.next(user);
  }

  login(email: string, password: string, rememberMe: boolean = false): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accounts/authenticate`, 
      { email, password }, 
      { withCredentials: true }
    ).pipe(map(response => {
      console.log('Login API response:', response);
      
      if (response && response.requiresTwoFactor) {
        return response;
      }
      
      if (response && response.account) {
        if (rememberMe) {
          localStorage.setItem('currentUser', JSON.stringify(response.account));
        }
        localStorage.setItem('accessToken', response.accessToken);
        this.currentUserSubject.next(response.account);
        return response.account;
      }
      return response;
    }));
  }

  completeTwoFactorLogin(userId: number, code: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/accounts/authenticate-2fa`, 
      { userId, code }, 
      { withCredentials: true }
    ).pipe(map(response => {
      console.log('2FA complete response:', response);
      
      if (response && response.account) {
        localStorage.setItem('currentUser', JSON.stringify(response.account));
        localStorage.setItem('accessToken', response.accessToken);
        this.currentUserSubject.next(response.account);
        return response.account;
      }
      return response;
    }));
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/accounts/register`, userData);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accounts/verify-email`, { token });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accounts/forgot-password`, { email });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accounts/validate-reset-token`, { token });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accounts/reset-password`, { token, password });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/accounts/${id}`);
  }

  updateUser(id: number, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/accounts/${id}`, userData);
  }

  changePassword(id: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/accounts/${id}`, {
      currentPassword,
      password: newPassword
    });
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/accounts/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/accounts`);
  }

  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/accounts/register`, userData);
  }

  updateUserByAdmin(id: number, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/accounts/${id}`, userData);
  }

  deleteUserByAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/accounts/${id}`);
  }

  uploadProfilePicture(formData: FormData): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/api/upload/profile-picture`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  // Add this method to check if user is logged in
isLoggedIn(): boolean {
  return this.currentUserValue !== null;
}
}