import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subject, concat, of, Observable } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  tap,
  map,
} from 'rxjs/operators';
import {
  ProjectService,
  CropItem,
  InvestorItem,
  ProjectCropDto,
  ProjectInvestorDto,
} from './project.service';
import Swal from 'sweetalert2';
import { SecureStorageService } from '../../../secure-storage.service';
import { trigger, transition, style, animate } from '@angular/animations';

export interface CropRowForm {
  crop: CropItem | null;
  plantCount: number;
  costPerPlant: number;
  estimatedYieldKg: number;
  expectedHarvestDate: string;
}

export interface InvestorRowForm {
  investor: InvestorItem | null;
  projectCropId: number | null;
  plantCount: number;
  amountInvested: number;
  investmentDate: string;
  paymentFrequency: string;
  installmentCount: number;
  installmentAmount: number;
  status: string;
}

@Component({
  selector: 'app-project',
  standalone: false,
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
  animations: [
    trigger('overlayAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('180ms ease', style({ opacity: 0 }))]),
    ]),
    trigger('modalAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px) scale(0.97)' }),
        animate(
          '280ms cubic-bezier(.4,0,.2,1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease',
          style({ opacity: 0, transform: 'translateY(16px) scale(0.97)' }),
        ),
      ]),
    ]),
  ],
})
export class ProjectComponent implements OnInit, OnDestroy {
  // ── Step state ───────────────────────────────────────────
  currentStep = 1;
  totalSteps = 3;
  submitting = false;

  // ── Step 1 — Project Info ────────────────────────────────
  projectForm!: FormGroup;
  projectId: number | null = null;

  paymentFrequencies = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
  projectStatuses = ['Active', 'Pending', 'Inactive'];

  // ── Step 2 — Crops ──────────────────────────────────────
  cropRows: CropRowForm[] = [this.emptyCropRow()];

  cropsLoading = false;
  crops$!: Observable<CropItem[]>;
  cropInput$ = new Subject<string>();

  savedProjectCropIds: number[] = []; // populated from getProjectCrops after step-2 submit
  projectCropsForSelect: { id: number; label: string }[] = [];

  // ── Step 3 — Investors ──────────────────────────────────
  investorRows: InvestorRowForm[] = [this.emptyInvestorRow()];

  investorsLoading = false;
  investors$!: Observable<InvestorItem[]>;
  investorInput$ = new Subject<string>();

  investorPaymentFrequencies = [
    'Monthly',
    'Quarterly',
    'Half-Yearly',
    'Yearly',
  ];
  investorStatuses = ['Active', 'Pending'];
  createdBy: any;
  projectName: string = '';

  private destroy$ = new Subject<void>();

  selectedLand: any = null;
  landModalOpen = false;
  landSearch = '';
  allLands: any[] = [];
  filteredLands: any[] = [];
  landsLoading = false;
  private landSearchTimer: any;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private secureStorage: SecureStorageService,
  ) {}

  ngOnInit(): void {
    this.buildProjectForm();
    this.initCropsSearch();
    this.initInvestorsSearch();
    this.createdBy = Number(this.secureStorage.getItem('userId')) || 1;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openLandPicker(): void {
    this.landModalOpen = true;
    if (this.allLands.length === 0) this.fetchLands('');
  }

  closeLandPicker(): void {
    this.landModalOpen = false;
  }

  confirmLandSelection(): void {
    this.landModalOpen = false;
    // landId form control is already set in selectLand()
  }

  selectLand(land: any): void {
    this.selectedLand = land;
    this.projectForm.patchValue({ landId: land.LandId });
    this.projectForm.get('landId')!.markAsTouched();
  }

  onLandSearch(term: string): void {
    clearTimeout(this.landSearchTimer);
    this.landSearchTimer = setTimeout(() => this.fetchLands(term), 350);
  }

  private fetchLands(search: string): void {
    this.landsLoading = true;
    this.projectService.getLands(search).subscribe({
      next: (res) => {
        this.allLands = res.data || [];
        this.filteredLands = this.allLands;
        this.landsLoading = false;
      },
      error: () => {
        this.landsLoading = false;
      },
    });
  }

  openInMaps(land: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!land.Latitude || !land.Longitude) return;

    const lat = land.Latitude;
    const lng = land.Longitude;

    // Use maps:// deep link on mobile, falls back to browser
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ─────────────────────────────────────────────────────────
  // FORM BUILDERS
  // ─────────────────────────────────────────────────────────
  private buildProjectForm(): void {
    this.projectForm = this.fb.group({
      projectCode: [''],
      landId: ['', [Validators.required, Validators.min(1)]],
      projectName: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      estimatedInvestment: ['', [Validators.required, Validators.min(1)]],
      paymentFrequency: [''],
      totalPlants: ['', [Validators.required, Validators.min(1)]],
      status: ['Active'],
      createdBy: this.createdBy,
    });
  }

  // ─────────────────────────────────────────────────────────
  // NG-SELECT lazy search helpers
  // ─────────────────────────────────────────────────────────
  private initCropsSearch(): void {
    this.crops$ = concat(
      this.projectService.getCrops('', 1, 20).pipe(
        map((r) => r.data),
        catchError(() => of([])),
      ),
      this.cropInput$.pipe(
        debounceTime(350),
        distinctUntilChanged(),
        tap(() => (this.cropsLoading = true)),
        switchMap((term) =>
          this.projectService.getCrops(term, 1, 20).pipe(
            map((r) => r.data),
            catchError(() => of([])),
            tap(() => (this.cropsLoading = false)),
          ),
        ),
      ),
    );
  }

  private initInvestorsSearch(): void {
    this.investors$ = concat(
      this.projectService.searchInvestors('').pipe(
        map((r) => r.data),
        catchError(() => of([])),
      ),
      this.investorInput$.pipe(
        debounceTime(350),
        distinctUntilChanged(),
        tap(() => (this.investorsLoading = true)),
        switchMap((term) =>
          this.projectService.searchInvestors(term).pipe(
            map((r) => r.data),
            catchError(() => of([])),
            tap(() => (this.investorsLoading = false)),
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // CROP ROWS
  // ─────────────────────────────────────────────────────────
  emptyCropRow(): CropRowForm {
    return {
      crop: null,
      plantCount: 0,
      costPerPlant: 0,
      estimatedYieldKg: 0,
      expectedHarvestDate: '',
    };
  }

  addCropRow(): void {
    this.cropRows.push(this.emptyCropRow());
  }

  removeCropRow(i: number): void {
    if (this.cropRows.length > 1) this.cropRows.splice(i, 1);
  }

  get cropRowsValid(): boolean {
    return this.cropRows.every(
      (r) =>
        r.crop &&
        r.plantCount > 0 &&
        r.costPerPlant > 0 &&
        r.estimatedYieldKg > 0 &&
        r.expectedHarvestDate,
    );
  }

  totalEstimatedCost(row: CropRowForm): number {
    return +(row.plantCount * row.costPerPlant).toFixed(2);
  }

  // ─────────────────────────────────────────────────────────
  // INVESTOR ROWS
  // ─────────────────────────────────────────────────────────
  emptyInvestorRow(): InvestorRowForm {
    return {
      investor: null,
      projectCropId: null,
      plantCount: 0,
      amountInvested: 0,
      investmentDate: '',
      paymentFrequency: 'Monthly',
      installmentCount: 1,
      installmentAmount: 0,
      status: 'Active',
    };
  }

  addInvestorRow(): void {
    this.investorRows.push(this.emptyInvestorRow());
  }

  removeInvestorRow(i: number): void {
    if (this.investorRows.length > 1) this.investorRows.splice(i, 1);
  }

  get investorRowsValid(): boolean {
    return this.investorRows.every(
      (r) =>
        r.investor &&
        r.projectCropId &&
        r.plantCount > 0 &&
        r.amountInvested > 0 &&
        r.investmentDate &&
        r.paymentFrequency &&
        r.installmentCount > 0 &&
        r.installmentAmount > 0,
    );
  }

  // ─────────────────────────────────────────────────────────
  // FIELD HELPERS (Step 1 form)
  // ─────────────────────────────────────────────────────────
  isInvalid(field: string): boolean {
    const c = this.projectForm.get(field)!;
    return c.invalid && c.touched;
  }

  isValid(field: string): boolean {
    const c = this.projectForm.get(field)!;
    return c.valid && c.touched;
  }

  // ─────────────────────────────────────────────────────────
  // STEP NAVIGATION & SUBMIT
  // ─────────────────────────────────────────────────────────
  nextStep(): void {
    if (this.currentStep === 1) {
      this.projectForm.markAllAsTouched();
      if (this.projectForm.invalid) return;
      this.submitStep1();
    } else if (this.currentStep === 2) {
      if (!this.cropRowsValid) {
        Swal.fire({
          icon: 'warning',
          title: 'Incomplete Crops',
          text: 'Fill all crop fields before proceeding.',
          confirmButtonColor: '#2d7a4f',
        });
        return;
      }
      this.submitStep2();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  private submitStep1(): void {
    if (this.projectId) {
      this.currentStep = 2;
      return;
    } // already saved

    this.submitting = true;
    const v = this.projectForm.value;

    this.projectService
      .createProject({
        ProjectCode: v.projectCode || undefined,
        LandId: +v.landId,
        ProjectName: v.projectName,
        StartDate: v.startDate,
        EndDate: v.endDate,
        EstimatedInvestment: +v.estimatedInvestment,
        PaymentFrequency: v.paymentFrequency || undefined,
        TotalPlants: +v.totalPlants,
        Status: v.status || undefined,
        CreatedBy: this.createdBy || 1,
      })
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.projectId = res.projectId;
          this.projectName = res.projectName;
          Swal.fire({
            icon: 'success',
            title: 'Project Created!',
            html: `
      <p style="color:#4a5568; margin-bottom:12px;">Project has been created successfully.</p>
      <div style="background:#f0f9f0; border:1.5px solid #a8dbbf; border-radius:10px; padding:12px 20px; display:inline-block;">
        <p style="font-size:.72rem; color:#666; margin:0 0 4px; text-transform:uppercase; letter-spacing:.5px;">Project Name</p>
        <p style="font-size:1.3rem; font-weight:700; color:#1a5c38; margin:0; font-family:'Playfair Display', serif;">${res.projectName}</p>
      </div>
      <p style="font-size:.78rem; color:#999; margin-top:10px;">Now add crops to this project.</p>
    `,
            confirmButtonText: 'Add Crops →',
            confirmButtonColor: '#2d7a4f',
            allowOutsideClick: false,
            customClass: { popup: 'swal-farmflow' },
          }).then(() => {
            this.currentStep = 2;
          });
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: err?.error || 'Could not create project.',
            confirmButtonColor: '#2d7a4f',
          });
        },
      });
  }

  private submitStep2(): void {
    this.submitting = true;

    const crops: ProjectCropDto[] = this.cropRows.map((r) => ({
      CropId: r.crop!.CropId,
      PlantCount: r.plantCount,
      CostPerPlant: r.costPerPlant,
      EstimatedYieldKg: r.estimatedYieldKg,
      ExpectedHarvestDate: r.expectedHarvestDate,
      TotalEstimatedCost: this.totalEstimatedCost(r),
    }));

    this.projectService
      .addProjectCrops({
        ProjectId: this.projectId!,
        CreatedBy: this.createdBy || 1,
        Crops: crops,
      })
      .subscribe({
        next: () => {
          // fetch saved project crops to map ProjectCropId for step 3
          this.projectService.getProjectCrops(this.projectId!).subscribe({
            next: (res) => {
              this.submitting = false;
              this.projectCropsForSelect = (res.data || []).map((c: any) => ({
                id: c.ProjectCropId,
                label: c.CropName || c.CropKey || `Crop #${c.ProjectCropId}`,
              }));
              const cropCount = this.cropRows.length;
              Swal.fire({
                icon: 'success',
                title: 'Crops Saved!',
                html: `
    <p style="color:#4a5568; margin-bottom:12px;">
      <strong>${cropCount}</strong> crop${cropCount > 1 ? 's have' : ' has'} been added to the project.
    </p>
    <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:8px;">
      ${this.cropRows
        .map(
          (r) => `
        <span style="background:#f0f9f0; border:1px solid #a8dbbf; border-radius:20px;
                     padding:4px 12px; font-size:.78rem; font-weight:600; color:#1a5c38;">
          ${r.crop ? r.crop.CropName : 'Crop'}
        </span>
      `,
        )
        .join('')}
    </div>
    <p style="font-size:.78rem; color:#999; margin-top:12px;">Finally, assign investors to this project.</p>
  `,
                confirmButtonText: 'Assign Investors →',
                confirmButtonColor: '#2d7a4f',
                allowOutsideClick: false,
                customClass: { popup: 'swal-farmflow' },
              }).then(() => {
                this.currentStep = 3;
              });
            },
            error: () => {
              this.submitting = false;
              this.currentStep = 3;
            },
          });
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: err?.error || 'Could not save crops.',
            confirmButtonColor: '#2d7a4f',
          });
        },
      });
  }

  onFinalSubmit(): void {
    if (!this.investorRowsValid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Investors',
        text: 'Fill all investor fields before submitting.',
        confirmButtonColor: '#2d7a4f',
      });
      return;
    }

    this.submitting = true;

    const investors: ProjectInvestorDto[] = this.investorRows.map((r) => ({
      InvestorId: r.investor!.InvestorId,
      ProjectCropId: r.projectCropId!,
      PlantCount: r.plantCount,
      AmountInvested: r.amountInvested,
      InvestmentDate: r.investmentDate,
      PaymentFrequency: r.paymentFrequency,
      InstallmentCount: r.installmentCount,
      InstallmentAmount: r.installmentAmount,
      Status: r.status,
    }));

    this.projectService
      .addProjectInvestors({
        ProjectId: this.projectId!,
        Investors: investors,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            icon: 'success',
            title: 'Project Launched! 🌱',
            html: `
    <p style="color:#4a5568; margin-bottom:16px;">
      Project <strong>#${this.projectName}</strong> is now live with
      <strong>${this.cropRows.length}</strong> crop${this.cropRows.length > 1 ? 's' : ''} and
      <strong>${this.investorRows.length}</strong> investor${this.investorRows.length > 1 ? 's' : ''}.
    </p>
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:4px;">
      <div style="background:#f0f9f0; border:1.5px solid #a8dbbf; border-radius:10px; padding:10px;">
        <p style="font-size:.68rem; color:#666; margin:0 0 4px; text-transform:uppercase; letter-spacing:.5px;">Project</p>
        <p style="font-size:1.1rem; font-weight:700; color:#1a5c38; margin:0; font-family:monospace;">#${this.projectName}</p>
      </div>
      <div style="background:#fff3d6; border:1.5px solid #f0d48a; border-radius:10px; padding:10px;">
        <p style="font-size:.68rem; color:#666; margin:0 0 4px; text-transform:uppercase; letter-spacing:.5px;">Crops</p>
        <p style="font-size:1.1rem; font-weight:700; color:#7a4a00; margin:0;">${this.cropRows.length}</p>
      </div>
      <div style="background:#e8e8fd; border:1.5px solid #b8b8f8; border-radius:10px; padding:10px;">
        <p style="font-size:.68rem; color:#666; margin:0 0 4px; text-transform:uppercase; letter-spacing:.5px;">Investors</p>
        <p style="font-size:1.1rem; font-weight:700; color:#202080; margin:0;">${this.investorRows.length}</p>
      </div>
    </div>
  `,
            confirmButtonText: 'Done',
            confirmButtonColor: '#2d7a4f',
            allowOutsideClick: false,
            customClass: { popup: 'swal-farmflow' },
          }).then(() => this.resetAll());
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: err?.error || 'Could not save investors.',
            confirmButtonColor: '#2d7a4f',
          });
        },
      });
  }

  resetAll(): void {
    this.currentStep = 1;
    this.projectId = null;
    this.projectForm.reset({ status: 'Active', createdBy: 'Admin' });
    this.cropRows = [this.emptyCropRow()];
    this.investorRows = [this.emptyInvestorRow()];
    this.projectCropsForSelect = [];
  }

  // Emoji helper for crop category
  categoryEmoji(cat: string): string {
    const map: Record<string, string> = {
      Fruit: '🍎',
      Vegetable: '🥦',
      Cereal: '🌾',
      'Grass Crop': '🌿',
      'Fiber crop': '🪢',
    };
    return map[cat] || '🌱';
  }
}
