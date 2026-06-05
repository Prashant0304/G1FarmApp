import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CropService } from './crop.service';
import { SecureStorageService } from '../../../secure-storage.service';

@Component({
  selector: 'app-crops',
  standalone: false,
  templateUrl: './crops.component.html',
  styleUrls: ['./crops.component.css'],
})
export class CropsComponent implements OnInit {
  // ── Crop list ──
  crops: any[] = [];
  isLoading = false;
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;
  searchText = '';
  searchDebounce: any;
  skeletons = Array(5).fill(0);

  // ── Selected crop + stages ──
  selectedCrop: any = null;
  stages: any[] = [];
  isLoadingStages = false;
  private stagesCache = new Map<number, any[]>();

  // ── Form state ──
  formOpen = false;
  isEditMode = false; // editing a crop
  isStageForm = false; // form is for a stage (not crop)
  isEditingStage = false; // editing existing stage vs adding new
  editingStage: any = null;
  isSaving = false;
  createdBy: any;

  form = this.emptyForm();

  uomList = [
    { id: 1, label: 'Kilogram (kg)' },
    { id: 2, label: 'Quintal' },
    { id: 3, label: 'Tonne' },
    { id: 4, label: 'Litre' },
  ];

  // Stage color palette — cycles through for each stage index
  private stageColors = [
    '#4caf7d',
    '#2d8653',
    '#e8a83a',
    '#e07b3a',
    '#5b9bd5',
    '#9b6bc4',
    '#e05a7a',
    '#3ab8c4',
  ];

  private emojiMap: Record<string, string> = {
    tomato: '🍅',
    potato: '🥔',
    wheat: '🌾',
    rice: '🍚',
    corn: '🌽',
    onion: '🧅',
    garlic: '🧄',
    carrot: '🥕',
    cotton: '🌿',
    sugarcane: '🎋',
    mango: '🥭',
    banana: '🍌',
    default: '🌱',
  };

  constructor(
    private cropService: CropService,
    private secureStorage: SecureStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = Number(this.secureStorage.getItem('userId')) || 0;
    this.loadCrops();
  }

  // ──────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────

  get lang() {
    return this.secureStorage.getItem('lang') || '2';
  }
  get totalPages() {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  getCropEmoji(key = ''): string {
    const l = key.toLowerCase();
    for (const k of Object.keys(this.emojiMap)) {
      if (l.includes(k)) return this.emojiMap[k];
    }
    return this.emojiMap['default'];
  }

  getUomLabel(id: number): string {
    return this.uomList.find((u) => u.id === id)?.label ?? '';
  }

  getStageColor(stageId: number): string {
    const idx = this.stages.findIndex((s) => s.StageId === stageId);
    return this.stageColors[idx % this.stageColors.length];
  }

  getFormTitle(): string {
    if (this.isStageForm)
      return this.isEditingStage ? 'Edit Stage' : 'Add Stage';
    if (this.isEditMode) return 'Edit Crop';
    return 'New Crop';
  }

  // Stage bar calculations
  getSegmentLeft(stage: any): number {
    const total = this.selectedCrop?.GrowthDurationDays || 1;
    return Math.max(0, ((stage.dayFrom - 1) / total) * 100);
  }

  getSegmentWidth(stage: any): number {
    const total = this.selectedCrop?.GrowthDurationDays || 1;
    return Math.min(100, ((stage.dayTo - stage.dayFrom + 1) / total) * 100);
  }

  getStageLeft(): number {
    const total = +this.form.growthDurationDays || +this.form.dayTo || 1;
    return Math.max(0, ((+this.form.dayFrom - 1) / total) * 100);
  }

  getStageWidth(): number {
    const total = +this.form.growthDurationDays || +this.form.dayTo || 1;
    return Math.min(
      100,
      ((+this.form.dayTo - +this.form.dayFrom + 1) / total) * 100,
    );
  }

  getStageCoverage(): number {
    if (!this.selectedCrop || !this.stages.length) return 0;
    const total = this.selectedCrop.GrowthDurationDays;
    // Count unique days covered
    const covered = new Set<number>();
    this.stages.forEach((s) => {
      for (let d = s.dayFrom; d <= Math.min(s.dayTo, total); d++)
        covered.add(d);
    });
    return Math.round((covered.size / total) * 100);
  }

  // ──────────────────────────────────────────
  // Crop list
  // ──────────────────────────────────────────

  loadCrops() {
    this.isLoading = true;
    this.cropService
      .getCrops(this.lang, this.searchText, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res: any) => {
          this.crops = res.data || [];
          this.totalRecords = res.total ?? this.crops.length;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearch() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.pageNumber = 1;
      this.loadCrops();
    }, 400);
  }

  clearSearch() {
    this.searchText = '';
    this.pageNumber = 1;
    this.loadCrops();
  }
  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadCrops();
    }
  }
  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadCrops();
    }
  }

  // ──────────────────────────────────────────
  // Stage timeline
  // ──────────────────────────────────────────

  selectCrop(crop: any) {
    // Toggle off if same crop clicked
    if (this.selectedCrop?.CropId === crop.CropId) {
      this.closeTimeline();
      return;
    }
    this.selectedCrop = crop;
    this.closeForm();
    this.loadStages(crop.CropId);
  }

  loadStages(cropId: number) {
    // Return from cache if available
    if (this.stagesCache.has(cropId)) {
      this.stages = this.stagesCache.get(cropId)!;
      return;
    }
    this.isLoadingStages = true;
    this.cropService.getStagesByCropId(cropId).subscribe({
      next: (res: any) => {
        this.stages = (res.data || []).sort(
          (a: any, b: any) => a.dayFrom - b.dayFrom,
        );
        this.stagesCache.set(cropId, this.stages);
        this.isLoadingStages = false;
        console.log('Stages : ', this.stages);
      },
      error: () => {
        this.isLoadingStages = false;
      },
    });
  }

  closeTimeline() {
    this.selectedCrop = null;
    this.stages = [];
    this.closeForm();
  }

  // ──────────────────────────────────────────
  // Form open helpers
  // ──────────────────────────────────────────

  openNewCropForm() {
    this.isEditMode = false;
    this.isStageForm = false;
    this.isEditingStage = false;
    this.editingStage = null;
    this.form = this.emptyForm();
    this.formOpen = true;
  }

  openEditCropForm(crop: any) {
    this.isEditMode = true;
    this.isStageForm = false;
    this.isEditingStage = false;
    this.editingStage = null;
    this.form = {
      cropId: crop.CropId,
      cropKey: crop.CropKey,
      categoryKey: crop.CategoryKey ?? '',
      growthDurationDays: crop.GrowthDurationDays,
      uomId: crop.DefaultUomId ?? '',
      stageKey: '',
      dayFrom: null,
      dayTo: null,
      createdBy: this.createdBy,
    };
    this.formOpen = true;
    // Also select this crop to show timeline
    if (!this.selectedCrop || this.selectedCrop.CropId !== crop.CropId) {
      this.selectedCrop = crop;
      this.loadStages(crop.CropId);
    }
  }

  openAddStageForm() {
    this.isStageForm = true;
    this.isEditMode = false;
    this.isEditingStage = false;
    this.editingStage = null;
    this.form = {
      ...this.emptyForm(),
      cropId: this.selectedCrop?.CropId ?? 0,
      cropKey: this.selectedCrop?.CropKey ?? '',
      growthDurationDays: this.selectedCrop?.GrowthDurationDays ?? null,
    };
    this.formOpen = true;
  }

  openEditStageForm(stage: any) {
    this.isStageForm = true;
    this.isEditMode = false;
    this.isEditingStage = true;
    this.editingStage = stage;
    this.form = {
      ...this.emptyForm(),
      cropId: this.selectedCrop?.CropId ?? 0,
      cropKey: this.selectedCrop?.CropKey ?? '',
      growthDurationDays: this.selectedCrop?.GrowthDurationDays ?? null,
      stageKey: stage.stageKey,
      dayFrom: stage.dayFrom,
      dayTo: stage.dayTo,
    };
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
    setTimeout(() => {
      this.form = this.emptyForm();
      this.isEditMode = false;
      this.isStageForm = false;
      this.isEditingStage = false;
      this.editingStage = null;
    }, 300);
  }

  // ──────────────────────────────────────────
  // Save
  // ──────────────────────────────────────────

  save() {
    // Validate crop fields
    if (!this.isStageForm) {
      if (!this.form.cropKey?.trim()) return this.err('Crop name is required');
      if (!this.form.categoryKey?.trim())
        return this.err('Category is required');
      if (!this.form.growthDurationDays)
        return this.err('Growth duration is required');
      if (!this.form.uomId) return this.err('Unit of measure is required');
    }

    // Always validate stage fields (new crop requires first stage)
    if (!this.isEditMode) {
      if (!this.form.stageKey?.trim())
        return this.err('Stage name is required');
      if (!this.form.dayFrom) return this.err('Day From is required');
      if (!this.form.dayTo) return this.err('Day To is required');
      if (+this.form.dayTo <= +this.form.dayFrom)
        return this.err('Day To must be greater than Day From');
    }

    this.isSaving = true;

    const payload: any = {
      cropId: this.form.cropId || 0,
      cropKey: this.form.cropKey,
      categoryKey: this.form.categoryKey,
      growthDurationDays: +this.form.growthDurationDays,
      defaultUomId: +this.form.uomId,
      stageKey: this.form.stageKey,
      dayFrom: +this.form.dayFrom,
      dayTo: +this.form.dayTo,
      createdBy: this.createdBy,
    };

    // For editing an existing stage, include stageId
    if (this.isEditingStage && this.editingStage) {
      payload.stageId = this.editingStage.stageId;
    }

    this.cropService.saveCrop(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.ok(
          this.isEditMode
            ? 'Crop updated!'
            : this.isEditingStage
              ? 'Stage updated!'
              : this.isStageForm
                ? 'Stage added!'
                : 'Crop saved!',
        );
        // Bust cache for this crop so timeline refreshes
        if (this.selectedCrop) {
          this.stagesCache.delete(this.selectedCrop.CropId);
          this.loadStages(this.selectedCrop.CropId);
        }
        this.closeForm();
        this.loadCrops();
      },
      error: () => {
        this.isSaving = false;
        this.err('Failed to save. Please try again.');
      },
    });
  }

  // ──────────────────────────────────────────
  // Delete stage
  // ──────────────────────────────────────────

  deleteStage(stage: any) {
    Swal.fire({
      title: 'Delete stage?',
      text: `"${stage.StageKey}" (Day ${stage.dayFrom}–${stage.dayTo}) will be removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.cropService.deleteStage(stage.stageId).subscribe({
        next: () => {
          this.ok('Stage deleted');
          if (this.selectedCrop) {
            this.stagesCache.delete(this.selectedCrop.CropId);
            this.loadStages(this.selectedCrop.CropId);
          }
        },
        error: () => this.err('Could not delete stage'),
      });
    });
  }

  // ──────────────────────────────────────────
  // Notification helpers
  // ──────────────────────────────────────────

  private ok(msg: string) {
    Swal.fire({
      icon: 'success',
      title: msg,
      timer: 2000,
      showConfirmButton: false,
      background: '#e8f5ee',
      confirmButtonColor: '#2d8653',
    });
  }

  private err(msg: string) {
    Swal.fire({
      icon: 'error',
      title: 'Oops',
      text: msg,
      confirmButtonColor: '#dc3545',
    });
  }

  private emptyForm() {
    return {
      cropId: 0,
      cropKey: '',
      categoryKey: '',
      growthDurationDays: null as any,
      uomId: '' as any,
      stageKey: '',
      dayFrom: null as any,
      dayTo: null as any,
      createdBy: this.createdBy,
    };
  }
}
