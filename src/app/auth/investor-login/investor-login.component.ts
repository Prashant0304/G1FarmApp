import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { InvestorService } from '../../investor/investor.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-investor-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './investor-login.component.html',
  styleUrls: ['./investor-login.component.css'],
})
export class InvestorLoginComponent {
  loginForm: FormGroup;

  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      mobileNumber: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.investorlogin(this.loginForm.value).subscribe({
      next: (res: any) => {
        console.log(res);

        localStorage.setItem('investorId', res.investorId);

        this.isLoading = false;
        this.router.navigate(['investor/overview']);
      },

      error: (err) => {
        console.error(err);

        this.errorMessage = 'Invalid mobile number or password';

        this.isLoading = false;
      },
    });
  }
}
