import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RegistrationService } from './registration.service';
import { Router } from '@angular/router';
import { FarmerOtpComponent } from '../farmer-otp/farmer-otp.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-farmer-registration',
  standalone: false,
  templateUrl: './farmer-registration.html',
  styleUrl: './farmer-registration.css',
})
export class FarmerRegistrationComponent {
  showAdditionalForm = signal(false);
  isSubmitting = signal(false);
  isDetectingGps = signal(false);
  gpsDetected = signal(false);

  // ── Data ────────────────────────────────────
  states: any[] = [];
  districts: any[] = [];
  hoblis: any[] = [];
  farmerId: number | null = null;

  // ── Form ────────────────────────────────────
  farmerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private farmerRegService: RegistrationService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
  ) {
    this.farmerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')],
      ],
      village: [''],
      stateId: ['', Validators.required],
      districtId: ['', Validators.required],
      hobliId: ['', Validators.required],
      landLocation: [''],
      soilType: [''],
      waterSource: [''],
      latitude: [''],
      longitude: [''],
      landSize: [''],
      LandUOMId: [''],
    });
  }

  ngOnInit(): void {
    this.loadStates();
  }

  // ── Getter ──────────────────────────────────
  get f(): { [key: string]: AbstractControl } {
    return this.farmerForm.controls;
  }

  get isStep1Invalid(): boolean {
    return (
      this.f['name'].invalid ||
      this.f['phoneNumber'].invalid ||
      this.f['stateId'].invalid ||
      this.f['districtId'].invalid ||
      this.f['hobliId'].invalid
    );
  }

  landUoms: any[] = [];

  // ── Load States ─────────────────────────────
  loadStates(): void {
    this.farmerRegService.getStates().subscribe({
      next: (res) => (this.states = res),
      error: () => this.toastr.error('Failed to load states'),
    });
  }

  // ── State Change → Load Districts ───────────
  onStateChange(): void {
    const stateId = this.f['stateId'].value;

    this.districts = [];
    this.farmerForm.patchValue({ districtId: '' });

    if (!stateId) return;

    this.farmerRegService.getDistricts(stateId).subscribe({
      next: (res) => (this.districts = res),
      error: () => this.toastr.error('Failed to load districts'),
    });
  }
  onDistrictChange(): void {
    const districtId = this.f['districtId'].value;

    this.hoblis = [];
    this.farmerForm.patchValue({ hobliId: '' });

    if (!districtId) return;

    this.farmerRegService.getHobli(districtId).subscribe({
      next: (res) => {
        this.hoblis = res;
        console.log(this.hoblis);
      },
      error: () => this.toastr.error('Failed to load districts'),
    });
  }

  // ── Submit Handler ──────────────────────────
  submitForm(): void {
    debugger;
    if (!this.showAdditionalForm()) {
      this.registerBasicDetails();
    } else {
      this.saveLandDetails();
    }
  }

  // ── Step 1 : Save Farmer + OTP ──────────────
  private registerBasicDetails(): void {
    if (this.isStep1Invalid) {
      this.markBasicFieldsTouched();
      this.toastr.warning('Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting.set(true);

    const basicData = {
      name: this.f['name'].value,
      phoneNumber: this.f['phoneNumber'].value,
      village: this.f['village'].value,
      stateId: this.f['stateId'].value,
      districtId: this.f['districtId'].value,
      hobliId: this.f['hobliId'].value,
    };

    this.farmerRegService.addFarmer(basicData).subscribe({
      next: (res) => {
        this.farmerId = res.farmerId;

        this.sendOtpAndOpenDialog(basicData.phoneNumber);
      },

      error: () => {
        this.isSubmitting.set(false);
        this.toastr.error('Registration failed. Please try again.');
      },
    });
  }

  // ── Send OTP ────────────────────────────────
  private sendOtpAndOpenDialog(phoneNumber: string): void {
    this.farmerRegService.sendOtp(phoneNumber).subscribe({
      next: (data: any) => {
        console.log(data[0].otp);

        this.isSubmitting.set(false);

        this.toastr.info(`OTP sent to ${phoneNumber}`);

        this.openOtpDialog(phoneNumber, data[0].otp);
      },

      error: () => {
        this.isSubmitting.set(false);

        this.toastr.error('Failed to send OTP.');
      },
    });
  }

  // ── OTP Dialog ──────────────────────────────
  private openOtpDialog(phoneNumber: string, otp: any): void {
    const dialogRef = this.dialog.open(FarmerOtpComponent, {
      width: '420px',
      disableClose: true,
      panelClass: 'otp-dialog',
      data: { phoneNumber, otp },
    });

    dialogRef.afterClosed().subscribe((verified: boolean) => {
      if (verified) {
        this.showAdditionalForm.set(true);

        this.toastr.success('Phone verified! Please complete land details.');

        this.getCurrentLocation();
        this.loadLandUOM();
      }
    });
  }

  loadLandUOM(): void {
    this.farmerRegService.getLandUOM().subscribe({
      next: (res) => {
        this.landUoms = res;
      },
      error: () => {
        this.toastr.error('Failed to load land units');
      },
    });
  }

  // ── Step 2 : Save Land Details ──────────────
  private saveLandDetails(): void {
    this.isSubmitting.set(true);

    const landData = {
      LandId: 0,
      FarmerId: this.farmerId,
      LandLocation: this.f['landLocation'].value,
      SoilType: this.f['soilType'].value,
      WaterSource: this.f['waterSource'].value,
      Latitude: this.f['latitude'].value,
      Longitude: this.f['longitude'].value,
      LandSize: this.f['landSize'].value,
      LandUOMId: this.f['LandUOMId'].value,
      UserId: null,
    };

    this.farmerRegService.addFarmerDetails(landData).subscribe({
      next: () => {
        this.isSubmitting.set(false);

        this.toastr.success('Farmer registration completed successfully!');

        this.authService.saveSession(this.farmerId!, '', '');

        this.farmerForm.reset();
        this.showAdditionalForm.set(false);
        this.gpsDetected.set(false);
        this.farmerId = null;

        this.router.navigate(['/farmer/farmer-dashboard']);
      },

      error: () => {
        this.isSubmitting.set(false);

        this.toastr.error('Failed to save land details.');
      },
    });
  }

  // ── GPS Detection ───────────────────────────
  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.toastr.error('Geolocation not supported.');
      return;
    }

    this.isDetectingGps.set(true);
    this.gpsDetected.set(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.farmerForm.patchValue({
          latitude: lat,
          longitude: lng,
        });

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        )
          .then((res) => res.json())
          .then((data) => {
            const place =
              data.address?.village ||
              data.address?.town ||
              data.address?.city ||
              data.address?.hamlet ||
              '';

            if (place) {
              this.farmerForm.patchValue({ landLocation: place });
            }

            this.isDetectingGps.set(false);
            this.gpsDetected.set(true);

            this.toastr.success(
              `Location detected: ${place || 'Coordinates saved'}`,
            );
          })
          .catch(() => {
            this.isDetectingGps.set(false);
            this.gpsDetected.set(true);

            this.toastr.success('GPS coordinates captured.');
          });
      },

      (error) => {
        this.isDetectingGps.set(false);

        console.error(error);

        this.toastr.error('Unable to detect location.');
      },

      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  // ── Helpers ─────────────────────────────────
  private markBasicFieldsTouched(): void {
    ['name', 'phoneNumber', 'stateId', 'districtId', 'hobliId'].forEach((key) =>
      this.farmerForm.get(key)?.markAsTouched(),
    );
  }
}
