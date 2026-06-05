import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subject, timer } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { InvestorService } from './investor.service';
import { IfscService, IfscDetails } from './ifsc.service';
import { SecureStorageService } from '../../../secure-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-investor',
  standalone: false,
  templateUrl: './register-investor.component.html',
  styleUrls: ['./register-investor.component.css'],
})
export class RegisterInvestorComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  aadhaarFile: File | null = null;
  panFile: File | null = null;
  aadhaarError = '';
  panError = '';

  ifscDetails: IfscDetails | null = null;
  ifscLoading = false;
  ifscError = '';

  submitting = false;
  currentStep = 1;
  totalSteps = 3;
  createdBy: any;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private investorService: InvestorService,
    private ifscService: IfscService,
    private secureStorage: SecureStorageService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.watchIfsc();
    this.createdBy = Number(this.secureStorage.getItem('userId')) || 1;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      // Step 1 — Personal Info
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: [
        '',
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
      ],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],

      // Step 2 — KYC
      aadhaarNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{12}$/)],
      ],
      panNumber: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      ],

      // Step 3 — Bank Details
      accountNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{9,18}$/)],
      ],
      ifscCode: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)],
      ],

      createdBy: this.createdBy,
    });
  }

  private watchIfsc(): void {
    this.form
      .get('ifscCode')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((val) => {
          const code = (val || '').toUpperCase().trim();
          if (code.length !== 11) {
            this.ifscDetails = null;
            this.ifscError = '';
            this.ifscLoading = false;
            return of(null);
          }
          this.ifscLoading = true;
          this.ifscError = '';
          this.ifscDetails = null;
          return this.ifscService.getBranchDetails(code).pipe(
            catchError(() => {
              this.ifscError = 'Invalid IFSC code. Please check and try again.';
              this.ifscLoading = false;
              return of(null);
            }),
          );
        }),
      )
      .subscribe((details) => {
        this.ifscLoading = false;
        if (details) {
          this.ifscDetails = details;
          this.ifscError = '';
        }
      });
  }

  // Step navigation
  get stepFields(): string[][] {
    return [
      ['name', 'email', 'mobileNumber', 'age'],
      ['aadhaarNumber', 'panNumber'],
      ['accountNumber', 'ifscCode'],
    ];
  }

  isStepValid(step: number): boolean {
    const fields = this.stepFields[step - 1];
    return fields.every((f) => this.form.get(f)!.valid);
  }

  nextStep(): void {
    const fields = this.stepFields[this.currentStep - 1];
    fields.forEach((f) => this.form.get(f)!.markAsTouched());

    const docValid =
      this.currentStep === 2
        ? this.aadhaarFile !== null && this.panFile !== null
        : true;

    if (this.isStepValid(this.currentStep) && docValid) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  // File handling
  onAadhaarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.aadhaarError = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.aadhaarError = 'Only PDF files are accepted.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.aadhaarError = 'File must be under 5 MB.';
      return;
    }
    this.aadhaarFile = file;
  }

  onPanSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.panError = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.panError = 'Only PDF files are accepted.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.panError = 'File must be under 5 MB.';
      return;
    }
    this.panFile = file;
  }

  removeAadhaar(): void {
    this.aadhaarFile = null;
    this.aadhaarError = '';
  }
  removePan(): void {
    this.panFile = null;
    this.panError = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Field helpers
  isInvalid(field: string): boolean {
    const c = this.form.get(field)!;
    return c.invalid && c.touched;
  }

  isValid(field: string): boolean {
    const c = this.form.get(field)!;
    return c.valid && c.touched;
  }

  // Submit
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.aadhaarFile || !this.panFile) return;

    this.submitting = true;
    const fd = new FormData();
    const v = this.form.value;

    fd.append('Name', v.name);
    fd.append('Email', v.email);
    fd.append('MobileNumber', v.mobileNumber);
    fd.append('Age', v.age);
    fd.append('AadhaarNumber', v.aadhaarNumber);
    fd.append('PANNumber', v.panNumber);
    fd.append('AccountNumber', v.accountNumber);
    fd.append('IFSCCode', v.ifscCode.toUpperCase());
    fd.append('CreatedBy', this.createdBy);
    fd.append('AadhaarDocument', this.aadhaarFile);
    fd.append('PANDocument', this.panFile);

    this.investorService.registerInvestor(fd).subscribe({
      next: (res) => {
        this.submitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Investor Registered!',
          html: `
            <p style="color:#4a5568; margin-bottom:12px;">${res.message}</p>
            <div style="background:#f0f9f0; border:1.5px solid #a8dbbf; border-radius:10px; padding:14px 20px; display:inline-block; margin-top:4px;">
              <p style="font-size:.75rem; color:#666; margin:0 0 4px; text-transform:uppercase; letter-spacing:.5px;">Auto-generated Password</p>
              <p style="font-size:1.4rem; font-weight:700; color:#1a5c38; letter-spacing:2px; margin:0; font-family:monospace;">${res.password}</p>
            </div>
            <p style="font-size:.78rem; color:#999; margin-top:12px;">Share this password securely with the investor.</p>
          `,
          confirmButtonText: 'Done',
          confirmButtonColor: '#2d7a4f',
          customClass: { popup: 'swal-farmflow' },
        }).then(() => {
          this.resetForm();
        });
      },
      error: (err) => {
        this.submitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text:
            err?.error ||
            err?.message ||
            'Something went wrong. Please try again.',
          confirmButtonColor: '#2d7a4f',
        });
      },
    });
  }

  resetForm(): void {
    this.form.reset({ createdBy: this.createdBy });
    this.aadhaarFile = null;
    this.panFile = null;
    this.aadhaarError = '';
    this.panError = '';
    this.ifscDetails = null;
    this.ifscError = '';
    this.currentStep = 1;
  }
}
