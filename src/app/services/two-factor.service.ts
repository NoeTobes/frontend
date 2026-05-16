import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class TwoFactorService {
  private apiUrl = `${environment.apiUrl}/api/2fa`;  // ← Now this works

  constructor(private http: HttpClient, private authService: AuthService) {}

  setup(): Observable<{ secret: string; qrCode: string }> {
    const token = this.authService.getToken();
    return this.http.post<{ secret: string; qrCode: string }>(
      `${this.apiUrl}/setup`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  enable(secret: string, token: string): Observable<{ message: string; backupCodes: string[] }> {
    const authToken = this.authService.getToken();
    return this.http.post<{ message: string; backupCodes: string[] }>(
      `${this.apiUrl}/enable`,
      { secret, token },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
  }

  disable(token: string): Observable<{ message: string }> {
    const authToken = this.authService.getToken();
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/disable`,
      { token },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
  }

  verify(userId: number, token: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/verify`, { userId, token });
  }

  getStatus(): Observable<{ enabled: boolean }> {
    const token = this.authService.getToken();
    return this.http.get<{ enabled: boolean }>(`${this.apiUrl}/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}