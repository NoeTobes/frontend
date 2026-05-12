import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  template: `
    <div *ngFor="let alert of alerts" class="alert alert-dismissible fade show" 
         [class.alert-success]="alert.type === 'success'"
         [class.alert-danger]="alert.type === 'danger'"
         [class.alert-info]="alert.type === 'info'"
         [class.alert-warning]="alert.type === 'warning'"
         role="alert">
      {{ alert.message }}
      <button type="button" class="btn-close" (click)="removeAlert(alert)"></button>
    </div>
  `
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  private subscription!: Subscription;

  constructor(private alertService: AlertService, private router: Router) {}

  ngOnInit() {
    this.subscription = this.alertService.onAlert().subscribe((alert: Alert) => {
      if (!alert.message) {
        this.alerts = [];
        return;
      }
      this.alerts.push(alert);
      
      if (alert.autoClose !== false) {
        setTimeout(() => this.removeAlert(alert), 3000);
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeAlert(alert: Alert) {
    this.alerts = this.alerts.filter(x => x !== alert);
  }
}