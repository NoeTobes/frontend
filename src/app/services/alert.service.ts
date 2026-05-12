import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Alert {
  id?: string;
  type: string;
  message: string;
  autoClose?: boolean;
  keepAfterRouteChange?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private subject = new Subject<Alert>();
  private defaultId = 'default-alert';

  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter(x => x && x.id === id));
  }

  success(message: string, options?: any) {
    this.alert({ ...options, type: 'success', message });
  }

  error(message: string, options?: any) {
    this.alert({ ...options, type: 'danger', message });
  }

  info(message: string, options?: any) {
    this.alert({ ...options, type: 'info', message });
  }

  warn(message: string, options?: any) {
    this.alert({ ...options, type: 'warning', message });
  }

  alert(alert: Alert) {
    alert.id = alert.id || this.defaultId;
    this.subject.next(alert);
  }

  clear(id = this.defaultId) {
    this.subject.next({ id, type: '', message: '' });
  }
  
}