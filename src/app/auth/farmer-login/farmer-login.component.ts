import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FarmerOtpComponent } from '../farmer-otp/farmer-otp.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-farmer-login',
  standalone: false,
  templateUrl: './farmer-login.component.html',
  styleUrl: './farmer-login.component.css',
})
export class FarmerLoginComponent {
  loginForm: FormGroup;

  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    // Already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')],
      ],
    });
  }

  get phone() {
    return this.loginForm.get('phoneNumber');
  }

  // ─────────────────────────────────────────────
  // SEND OTP
  // ─────────────────────────────────────────────
  sendOtp(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      this.toastr.warning('Please enter a valid 10-digit mobile number.');

      return;
    }

    const phoneNumber = this.loginForm.value.phoneNumber;

    this.isLoading.set(true);

    this.authService.getFarmerByPhone(phoneNumber).subscribe({
      next: (farmer) => {
        debugger;
        if (farmer.exists) {
          this.authService.sendOtp(phoneNumber).subscribe({
            next: (data: any) => {
              this.isLoading.set(false);

              this.toastr.success(`OTP sent to ${phoneNumber}`);

              this.openOtpDialog(phoneNumber, farmer, data[0].otp);
            },

            error: () => {
              this.isLoading.set(false);

              this.toastr.error('Failed to send OTP.');
            },
          });
        } else {
          this.isLoading.set(false);
          this.toastr.error(`Please register before login`);
        }
        // SEND OTP
      },

      error: () => {
        this.isLoading.set(false);

        this.toastr.error('Server error. Please try again.');
      },
    });
  }

  // ─────────────────────────────────────────────
  // OTP DIALOG
  // ─────────────────────────────────────────────
  openOtpDialog(phoneNumber: string, farmer: any, otp: any): void {
    const dialogRef = this.dialog.open(FarmerOtpComponent, {
      width: '420px',
      disableClose: true,
      panelClass: 'otp-dialog',
      data: { phoneNumber, otp },
    });

    dialogRef.afterClosed().subscribe((verified: boolean) => {
      if (verified) {
        // Save session
        this.authService.saveSession(
          farmer.farmerId,
          farmer.name,
          farmer.phoneNumber,
        );

        this.toastr.success('Login successful');

        this.router.navigate(['/farmer/farmer-dashboard']);
      }
    });
  }
}
