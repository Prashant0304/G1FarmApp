import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-farmer-otp',
  standalone: false,
  templateUrl: './farmer-otp.component.html',
  styleUrls: ['./farmer-otp.component.css'],
})
export class FarmerOtpComponent {
  otpForm: FormGroup;
  phone: string = '';
  generatedOtp: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<FarmerOtpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    debugger;
    this.phone = data.phoneNumber;
    this.generatedOtp = data.otp;

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) {
      this.toastr.warning('Please enter OTP');
      return;
    }

    const otp = this.otpForm.value.otp;

    this.authService.verifyOtp(this.phone, otp).subscribe({
      next: (res: any) => {
        if (res.success || res.result === 1) {
          this.toastr.success('OTP verified successfully');

          this.dialogRef.close(true);
        } else {
          this.toastr.error(res.message || 'Invalid OTP');
        }
      },

      error: () => {
        this.toastr.error('OTP verification failed');
      },
    });
  }

  // ⏱️ Timer state
  resendDisabled = true;
  countdown = 30;
  timer: any;

  ngOnInit(): void {
    this.startTimer();
  }

  // ▶ Start countdown
  startTimer() {
    this.resendDisabled = true;
    this.countdown = 30;

    this.timer = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  // 🔁 Resend OTP
  resendOtp() {
    if (this.resendDisabled) return;

    this.authService.resendOtp(this.phone).subscribe({
      next: (data: any) => {
        this.generatedOtp = data.otp;
        this.toastr.success('OTP resent successfully');
        this.startTimer(); // restart timer
      },
      error: () => {
        this.toastr.error('Failed to resend OTP');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  cancelOtp() {
    this.dialogRef.close(false);
  }
}
