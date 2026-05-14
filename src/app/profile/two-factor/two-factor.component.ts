import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TwoFactorService } from '../../services/two-factor.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-two-factor',
  templateUrl: './two-factor.component.html',
  styleUrls: ['./two-factor.component.css']
})
export class TwoFactorComponent implements OnInit {
  setupMode = false;
  twoFactorEnabled = false;
  qrCode: string = '';
  secret: string = '';
  backupCodes: string[] = [];
  loading = false;
  verifyForm!: FormGroup;
  disableForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private twoFactorService: TwoFactorService,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadStatus();
    
    this.verifyForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    
    this.disableForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  loadStatus() {
    this.twoFactorService.getStatus().subscribe({
      next: (status) => {
        this.twoFactorEnabled = status.enabled;
      },
      error: (error) => {
        console.error('Failed to load 2FA status:', error);
      }
    });
  }

  setup2FA() {
    this.loading = true;
    this.twoFactorService.setup().subscribe({
      next: (response) => {
        this.qrCode = response.qrCode;
        this.secret = response.secret;
        this.setupMode = true;
        this.loading = false;
      },
      error: (error) => {
        this.alertService.error('Failed to setup 2FA');
        this.loading = false;
      }
    });
  }

  enable2FA() {
    if (this.verifyForm.invalid) {
      this.alertService.error('Please enter a valid 6-digit code');
      return;
    }
    
    this.loading = true;
    const token = this.verifyForm.get('token')?.value;
    
    this.twoFactorService.enable(this.secret, token).subscribe({
      next: (response) => {
        this.backupCodes = response.backupCodes;
        this.twoFactorEnabled = true;
        this.setupMode = false;
        this.alertService.success('2FA enabled successfully!');
        this.loading = false;
        this.showBackupCodes();
      },
      error: (error) => {
        this.alertService.error(error.error?.message || 'Failed to enable 2FA');
        this.loading = false;
      }
    });
  }

  disable2FA() {
    if (this.disableForm.invalid) {
      this.alertService.error('Please enter a valid 6-digit code');
      return;
    }
    
    if (confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
      this.loading = true;
      const token = this.disableForm.get('token')?.value;
      
      this.twoFactorService.disable(token).subscribe({
        next: () => {
          this.twoFactorEnabled = false;
          this.alertService.success('2FA disabled successfully');
          this.loading = false;
          this.disableForm.reset();
        },
        error: (error) => {
          this.alertService.error(error.error?.message || 'Failed to disable 2FA');
          this.loading = false;
        }
      });
    }
  }

  showBackupCodes() {
    let message = '⚠️ SAVE THESE BACKUP CODES! ⚠️\n\n';
    message += 'Store these codes in a safe place. Each code can be used only once.\n\n';
    this.backupCodes.forEach((code, index) => {
      message += `${index + 1}. ${code}\n`;
    });
    message += '\nYou will need these if you lose access to your authenticator app.';
    
    alert(message);
  }

  cancelSetup() {
    this.setupMode = false;
    this.verifyForm.reset();
  }
}