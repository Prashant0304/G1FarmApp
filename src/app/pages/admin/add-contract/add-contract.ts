import { Component } from '@angular/core';
import { ContractService } from './contract';
import { debounceTime, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { SecureStorageService } from '../../../secure-storage.service';

@Component({
  selector: 'app-add-contract',
  standalone: false,
  templateUrl: './add-contract.html',
  styleUrls: ['./add-contract.css'],
})
export class AddContract {
  searchText = '';
  searchSubject = new Subject<string>();
  contractSearchSubject = new Subject<string>();
  selectedFarmer: any = null;
  farmers: any[] = [];
  lands: any[] = [];
  crops: any[] = [];
  isLoadingCrops = false;
  contracts: any[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalRecords = 0;
  contractSearch = '';
  isLoadingContracts = false;
  lang = '1';
  isEditMode = false;
  editingContractId = 0;
  userId: any;

  form = {
    farmerId: 0,
    landId: 0 as any,
    cropId: 0 as any,
    startDate: '',
    endDate: '',
    rate: 0,
    yield: 0,
  };
  selectedLang: string = '';

  constructor(
    private farmService: ContractService,
    private secureStorage: SecureStorageService,
  ) {}

  ngOnInit() {
    this.selectedLang = this.secureStorage.getItem('lang') || '2';
    this.userId = Number(this.secureStorage.getItem('userId')) || 0;
    console.log('LANG CODE:', this.selectedLang);
    this.loadCrops();
    this.loadContracts();

    this.searchSubject
      .pipe(debounceTime(400))
      .subscribe((value) => this.searchFarmer(value));

    this.contractSearchSubject
      .pipe(debounceTime(400))
      .subscribe(() => this.loadContracts());
  }

  onSearchChange() {
    if (this.searchText.length < 2) {
      this.farmers = [];
      return;
    }
    this.searchSubject.next(this.searchText);
  }

  searchFarmer(search: string) {
    this.farmService.getFarmers(search).subscribe({
      next: (res: any) => {
        this.farmers = (res.data || []).map((f: any) => ({
          farmerId: f.FarmerId,
          name: f.Name,
          phone: f.Phone,
        }));
      },
      error: () => {
        this.farmers = [];
      },
    });
  }

  selectFarmer(farmer: any) {
    this.selectedFarmer = farmer;
    this.form.farmerId = farmer.farmerId;
    this.farmers = [];
    this.searchText = '';
    this.loadLands(farmer.farmerId);
  }

  clearFarmer() {
    this.selectedFarmer = null;
    this.form.farmerId = 0;
    this.form.landId = '';
    this.lands = [];
    this.searchText = '';
  }

  loadLands(farmerId: number) {
    this.farmService.getLandsByFarmerId(farmerId).subscribe((res: any[]) => {
      this.lands = res.map((l) => ({
        landId: l.LandId,
        landLocation: l.LandLocation,
        soilType: l.SoilType,
        waterSource: l.WaterSource,
      }));
    });
  }

  loadCrops() {
    this.isLoadingCrops = true;
    this.farmService
      .getCrops(
        this.selectedLang, // 👈 pass lang here
        this.searchText || '',
        this.pageNumber || 1,
        this.pageSize || 10,
      )
      .subscribe({
        next: (res: any) => {
          this.crops = res.data || [];
          this.isLoadingCrops = false;
        },
        error: () => {
          this.crops = [];
          this.isLoadingCrops = false;
        },
      });
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    this.pageNumber = page;
    this.loadContracts();
  }

  onContractSearch() {
    if (this.contractSearch.length > 0 && this.contractSearch.length < 3)
      return;
    this.pageNumber = 1;
    this.contractSearchSubject.next(this.contractSearch);
  }

  loadContracts() {
    this.isLoadingContracts = true;
    this.farmService
      .getContracts(
        this.selectedLang,
        this.contractSearch,
        this.pageNumber,
        this.pageSize,
      )
      .subscribe({
        next: (res: any) => {
          this.contracts = (res.data || []).map((c: any) => ({
            contractId: c.ContractId ?? c.contractId,
            farmerName: c.FarmerName ?? c.farmerName,
            cropName: c.CropName ?? c.cropName,
            agreedRatePerKg: c.AgreedRatePerKg ?? c.agreedRatePerKg,
            status: c.Status ?? c.status,
            startDate: c.StartDate ?? c.startDate,
            endDate: c.EndDate ?? c.endDate,
            landId: c.LandId ?? c.landId,
            landLocation: c.LandLocation ?? c.landLocation,
            farmerId: c.FarmerId ?? c.farmerId,
            cropId: c.CropId ?? c.cropId,
            expectedYield: c.ExpectedYield ?? c.expectedYield,
          }));
          this.totalRecords = res.total ?? this.contracts.length;
          this.isLoadingContracts = false;
        },
        error: () => {
          this.isLoadingContracts = false;
        },
      });
  }

  loadContractIntoForm(c: any) {
    this.isEditMode = true;
    this.editingContractId = c.contractId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.farmService.getContractById(c.contractId).subscribe({
      next: (res: any) => {
        const d = Array.isArray(res) ? res[0] : (res.data ?? res);

        const farmerId = d.FarmerId ?? d.farmerId;
        const landId = d.LandId ?? d.landId;
        const cropId = d.CropId ?? d.cropId;

        this.selectedFarmer = {
          farmerId,
          name: d.Name ?? d.FarmerName ?? d.farmerName ?? c.farmerName,
          phone: d.Phone ?? d.phone ?? '',
        };
        this.form.farmerId = farmerId;
        this.form.cropId = cropId;
        this.form.startDate = this.toDateInputValue(
          d.StartDate ?? d.startDate ?? '',
        );
        this.form.endDate = this.toDateInputValue(d.EndDate ?? d.endDate ?? '');
        this.form.rate = d.AgreedRatePerKg ?? d.agreedRatePerKg ?? 0;
        this.form.yield = d.ExpectedYield ?? d.expectedYield ?? 0;

        this.farmService
          .getLandsByFarmerId(farmerId)
          .subscribe((lands: any[]) => {
            this.lands = lands.map((l) => ({
              landId: l.LandId,
              landLocation: l.LandLocation,
              soilType: l.SoilType,
              waterSource: l.WaterSource,
            }));
            setTimeout(() => {
              this.form.landId = landId;
            }, 0);
          });
      },
      error: () => {
        this.showError('Could not load contract details.');
      },
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editingContractId = 0;
    this.resetForm();
  }

  private toDateInputValue(isoString: string): string {
    if (!isoString) return '';
    return isoString.split('T')[0];
  }

  saveContract() {
    if (!this.form.farmerId) return this.showError('Please select a farmer');
    if (!this.form.landId) return this.showError('Please select a land');
    if (!this.form.cropId) return this.showError('Please select a crop');
    if (!this.form.startDate) return this.showError('Please set start date');
    if (!this.form.endDate) return this.showError('Please set end date');
    if (this.form.rate <= 0)
      return this.showError('Rate must be greater than 0');
    if (this.form.yield <= 0)
      return this.showError('Expected yield must be greater than 0');

    if (new Date(this.form.endDate) <= new Date(this.form.startDate)) {
      return this.showError('End date must be after start date');
    }

    const payload = {
      contractId: this.isEditMode ? this.editingContractId : 0,
      farmerId: this.form.farmerId,
      cropId: this.form.cropId,
      landId: this.form.landId,
      startDate: this.form.startDate,
      endDate: this.form.endDate,
      rate: this.form.rate,
      yield: this.form.yield,
      userId: this.userId,
    };

    this.farmService.saveContract(payload).subscribe({
      next: () => {
        this.showSuccess(
          this.isEditMode
            ? 'Contract updated successfully'
            : 'Contract saved successfully',
        );
        this.isEditMode = false;
        this.editingContractId = 0;
        this.resetForm();
        this.loadContracts();
      },
      error: () => this.showError('Error saving contract'),
    });
  }

  resetForm() {
    this.form = {
      farmerId: 0,
      landId: '',
      cropId: '',
      startDate: '',
      endDate: '',
      rate: 0,
      yield: 0,
    };
    this.selectedFarmer = null;
    this.lands = [];
    this.searchText = '';
  }

  showSuccess(msg: string) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: msg,
      background: '#e6f4ea',
      confirmButtonColor: '#198754',
    });
  }

  showError(msg: string) {
    Swal.fire({
      icon: 'error',
      title: 'Oops',
      text: msg,
      confirmButtonColor: '#dc3545',
    });
  }
}
