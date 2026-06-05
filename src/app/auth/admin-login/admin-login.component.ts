import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { SecureStorageService } from '../../secure-storage.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent {
  form: FormGroup;
  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private secureStorage: SecureStorageService,
  ) {
    this.form = this.fb.group({
      mobileNumber: [
        '',
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get mobile() {
    return this.form.get('mobileNumber')!;
  }
  get password() {
    return this.form.get('password')!;
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  // onSubmit() {
  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();
  //     return;
  //   }
  //   this.loading.set(true);
  //   this.errorMsg.set('');
  //   this.auth.login(this.form.value).subscribe({
  //     next: (res) => {
  //       this.loading.set(false);
  //       if (res.success) this.router.navigate(['/dashboard']);
  //       else this.errorMsg.set(res.message || 'Login failed.');
  //     },
  //     error: (err) => {
  //       this.loading.set(false);
  //       this.errorMsg.set(
  //         err?.error?.message || 'Invalid credentials. Please try again.',
  //       );
  //     },
  //   });
  // }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.errorMsg.set('');

    this.auth.adminLogin(this.form.value).subscribe({
      next: (res) => {
        this.loading.set(false);

        if (res.success) {
          this.auth.saveAdminSession(res.data);

          this.secureStorage.setItem('userId', res.data.userId);
          this.secureStorage.setItem('roleId', res.data.roleId);

          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMsg.set(res.message || 'Login failed.');
        }
      },

      error: (err) => {
        this.loading.set(false);

        this.errorMsg.set(
          err?.error?.message || 'Invalid credentials. Please try again.',
        );
      },
    });
  }
}
