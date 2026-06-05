import { Component, OnInit } from '@angular/core';
import { SecureStorageService } from '../../../secure-storage.service';
import Swal from 'sweetalert2';
import { FarmerService } from './farmer.service';
import * as L from 'leaflet';
import { ElementRef, ViewChild } from '@angular/core';

const iconDefault = L.icon({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-farmers',
  standalone: false,
  templateUrl: './manage-farmers.component.html',
  styleUrls: ['./manage-farmers.component.css'],
})
export class ManageFarmersComponent implements OnInit {
  @ViewChild('landPickerMap')
  landPickerMap!: ElementRef;

  // ── List ──
  farmers: any[] = [];
  isLoading = false;
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;
  searchText = '';
  searchDebounce: any;
  skeletons = Array(6).fill(0);
  filterVerified: boolean | null = null;
  states: any[] = [];
  districts: any[] = [];

  statesLoaded = false;
  districtsLoaded = false;

  // ── Selection ──
  selectedFarmer: any = null;

  // ── Lands ──
  lands: any[] = [];
  isLoadingLands = false;
  private landsCache = new Map<number, any[]>();

  // ── Edit farmer ──
  editMode = false;
  isSaving = false;
  editForm = this.emptyFarmerForm();

  // ── Land edit ──
  editingLandId: number | null = null;
  isSavingLand = false;
  landEditForm = this.emptyLandForm();

  // ── Add land ──
  addLandMode = false;
  newLandForm = this.emptyLandForm();

  soilTypes = [
    'Red',
    'Black',
    'Alluvial',
    'Sandy',
    'Clay',
    'Loamy',
    'Laterite',
  ];
  waterSources = [
    'Rain-fed',
    'Canal',
    'Borewell',
    'River',
    'Pond',
    'Ground Water',
    'Drip Irrigation',
  ];
  uomList: any[] = [];
  createdBy: any;

  // maps
  showMapPicker = false;

  mapMode: 'edit' | 'new' = 'new';

  private map!: L.Map;

  private mapMarker!: L.Marker;

  selectedLat: number | null = null;

  selectedLng: number | null = null;

  constructor(
    private farmersService: FarmerService,
    private secureStorage: SecureStorageService,
  ) {}

  ngOnInit() {
    this.loadFarmers();
    this.loadUoms();
    this.createdBy = Number(this.secureStorage.getItem('userId')) || 0;
  }

  get lang() {
    return this.secureStorage.getItem('lang') || '2';
  }
  get totalPages() {
    return Math.ceil(this.totalRecords / this.pageSize);
  }
  get verifiedCount() {
    return this.farmers.filter((f) => f.IsVerified).length;
  }

  // ─────────────────────────────────────────────────
  // Farmer list
  // ─────────────────────────────────────────────────

  loadFarmers() {
    this.isLoading = true;
    this.farmersService
      .getFarmers(
        this.searchText,
        this.pageNumber,
        this.pageSize,
        this.filterVerified,
      )
      .subscribe({
        next: (res: any) => {
          const raw = res.data || [];
          this.farmers = raw.map((f: any) => ({
            FarmerId: f.FarmerId ?? f.farmerId,
            Name: f.Name ?? f.name,
            PhoneNumber: f.PhoneNumber ?? f.phoneNumber,
            Village: f.Village ?? f.village,
            DistrictId: f.DistrictId ?? f.districtId,
            StateId: f.StateId ?? f.stateId,
            LandSize: f.LandSize ?? f.landSize,
            IsVerified: f.IsVerified ?? f.isVerified,
            IsDeleted: f.IsDeleted ?? f.isDeleted,
            LandCount: f.LandCount ?? f.landCount ?? 0,
            StateName: f.StateName ?? f.stateName,
            DistrictName: f.DistrictName ?? f.districtName,
          }));
          this.totalRecords = res.total ?? this.farmers.length;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onBackdropClick(event: MouseEvent) {
    if (
      (event.target as HTMLElement).classList.contains('map-modal-backdrop')
    ) {
      this.closeMapPicker();
    }
  }

  openMapPicker(mode: 'edit' | 'new') {
    this.mapMode = mode;
    this.showMapPicker = true;
    this.selectedLat = null;
    this.selectedLng = null;

    // Wait for Angular to render the modal into the DOM
    setTimeout(() => {
      const mapElement = this.landPickerMap?.nativeElement;
      if (!mapElement) {
        console.error('Map element not ready');
        return;
      }

      if (this.map) {
        this.map.remove();
        (this.map as any) = null;
      }

      this.map = L.map(mapElement, { zoomControl: true }).setView(
        [20.5937, 78.9629],
        5,
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.selectedLat = lat;
        this.selectedLng = lng;
        if (this.mapMarker) this.map.removeLayer(this.mapMarker);
        this.mapMarker = L.marker([lat, lng]).addTo(this.map);
      });

      // Force Leaflet to recalculate container size after CSS transition settles
      setTimeout(() => this.map.invalidateSize(), 150);
      setTimeout(() => this.map.invalidateSize(), 400);
    }, 100); // 100 ms is enough after showMapPicker = true triggers *ngIf
  }

  closeMapPicker() {
    this.showMapPicker = false;

    if (this.map) {
      this.map.remove();
    }
  }

  confirmMapLocation() {
    if (!this.selectedLat || !this.selectedLng) {
      return this.showError('Please select location from map');
    }

    if (this.mapMode === 'edit') {
      this.landEditForm.latitude = this.selectedLat;
      this.landEditForm.longitude = this.selectedLng;
    } else {
      this.newLandForm.latitude = this.selectedLat;
      this.newLandForm.longitude = this.selectedLng;
    }

    this.closeMapPicker();
  }

  onSearch() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.pageNumber = 1;
      this.loadFarmers();
    }, 400);
  }

  clearSearch() {
    this.searchText = '';
    this.pageNumber = 1;
    this.loadFarmers();
  }
  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadFarmers();
    }
  }
  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadFarmers();
    }
  }

  setFilter(val: boolean | null) {
    this.filterVerified = val;
    this.pageNumber = 1;
    this.loadFarmers();
  }

  // ─────────────────────────────────────────────────
  // Selection + lands
  // ─────────────────────────────────────────────────

  selectFarmer(farmer: any) {
    if (this.selectedFarmer?.FarmerId === farmer.FarmerId) {
      this.closeDetail();
      return;
    }
    this.selectedFarmer = farmer;
    this.editMode = false;
    this.addLandMode = false;
    this.editingLandId = null;
    this.loadLands(farmer.FarmerId);
  }

  closeDetail() {
    this.selectedFarmer = null;
    this.editMode = false;
    this.addLandMode = false;
    this.editingLandId = null;
    this.lands = [];
  }

  loadLands(farmerId: number) {
    if (this.landsCache.has(farmerId)) {
      this.lands = this.landsCache.get(farmerId)!;
      return;
    }
    this.isLoadingLands = true;
    this.farmersService.getLandsByFarmerId(farmerId).subscribe({
      next: (res: any) => {
        this.lands = (res.data || res || []).map((l: any) => ({
          LandId: l.LandId ?? l.landId,
          FarmerId: l.FarmerId ?? l.farmerId,
          LandLocation: l.LandLocation ?? l.landLocation,
          SoilType: l.SoilType ?? l.soilType,
          WaterSource: l.WaterSource ?? l.waterSource,
          LandUom: l.LandUom ?? l.landUom,
          Latitude: l.Latitude ?? l.latitude,
          Longitude: l.Longitude ?? l.longitude,
        }));
        this.landsCache.set(farmerId, this.lands);
        this.isLoadingLands = false;
      },
      error: () => {
        this.isLoadingLands = false;
      },
    });
  }

  // ─────────────────────────────────────────────────
  // Edit farmer
  // ─────────────────────────────────────────────────

  toggleEdit() {
    this.editMode = !this.editMode;

    if (this.editMode && this.selectedFarmer) {
      this.editForm = {
        name: this.selectedFarmer.Name,
        phoneNumber: this.selectedFarmer.PhoneNumber,
        village: this.selectedFarmer.Village || '',
        districtId: this.selectedFarmer.DistrictId || '',
        stateId: this.selectedFarmer.StateId || '',
        landSize: this.selectedFarmer.LandSize || null,
      };

      // Default selected values only
      this.states = [
        {
          stateId: this.selectedFarmer.StateId,
          stateName: this.selectedFarmer.StateName,
        },
      ];

      this.districts = [
        {
          districtId: this.selectedFarmer.DistrictId,
          districtName: this.selectedFarmer.DistrictName,
        },
      ];

      this.statesLoaded = false;
      this.districtsLoaded = false;
    }
  }

  cancelEdit() {
    this.editMode = false;
  }

  loadStates() {
    if (this.statesLoaded) return;

    this.farmersService.getStates().subscribe({
      next: (res: any) => {
        this.states = res.data || res || [];
        this.statesLoaded = true;
      },
    });
  }

  loadUoms() {
    this.farmersService.getLandUom().subscribe({
      next: (res: any) => {
        this.uomList = res.data || res || [];
      },
    });
  }

  onDistrictDropdownOpen() {
    if (!this.editForm.stateId) return;

    this.loadDistricts(Number(this.editForm.stateId));
  }

  onStateDropdownOpen() {
    this.loadStates();

    if (this.editForm.stateId) {
      this.loadDistricts(Number(this.editForm.stateId));
    }
  }

  loadDistricts(stateId: number) {
    if (!stateId) return;

    this.farmersService.getDistrictsByState(stateId).subscribe({
      next: (res: any) => {
        this.districts = res.data || res || [];
        this.districtsLoaded = true;
      },
    });
  }

  onStateChange() {
    this.editForm.districtId = '';

    this.loadDistricts(Number(this.editForm.stateId));
  }

  saveFarmer() {
    if (!this.editForm.name?.trim()) return this.showError('Name is required');
    if (!this.editForm.phoneNumber?.trim())
      return this.showError('Phone number is required');

    this.isSaving = true;
    const payload = {
      farmerId: this.selectedFarmer.FarmerId,
      name: this.editForm.name,
      phoneNumber: this.editForm.phoneNumber,
      village: this.editForm.village,
      districtId: this.editForm.districtId,
      stateId: this.editForm.stateId,
      landSize: this.editForm.landSize ? Number(this.editForm.landSize) : null,
      updatedBy: this.createdBy,
    };

    this.farmersService.saveFarmer(payload).subscribe({
      next: () => {
        this.isSaving = false;

        const farmerId = this.selectedFarmer.FarmerId;

        this.farmersService
          .getFarmers(
            this.searchText,
            this.pageNumber,
            this.pageSize,
            this.filterVerified,
          )
          .subscribe({
            next: (res: any) => {
              const raw = res.data || [];

              this.farmers = raw.map((f: any) => ({
                FarmerId: f.FarmerId ?? f.farmerId,
                Name: f.Name ?? f.name,
                PhoneNumber: f.PhoneNumber ?? f.phoneNumber,
                Village: f.Village ?? f.village,
                DistrictId: f.DistrictId ?? f.districtId,
                DistrictName: f.DistrictName ?? f.districtName,
                StateId: f.StateId ?? f.stateId,
                StateName: f.StateName ?? f.stateName,
                LandSize: f.LandSize ?? f.landSize,
                IsVerified: f.IsVerified ?? f.isVerified,
                IsDeleted: f.IsDeleted ?? f.isDeleted,
                landCount: f.LandCount ?? f.landCount ?? 0,
              }));

              const updatedFarmer = this.farmers.find(
                (f) => f.FarmerId === farmerId,
              );

              if (updatedFarmer) {
                this.selectedFarmer = updatedFarmer;
              }

              this.editMode = false;

              this.showSuccess('Farmer details updated');
            },

            error: () => {
              this.showError('Saved but failed to refresh data');
            },
          });
      },
      error: () => {
        this.isSaving = false;
        this.showError('Failed to save changes');
      },
    });
  }

  // ─────────────────────────────────────────────────
  // Verify farmer
  // ─────────────────────────────────────────────────

  toggleVerification() {
    const newStatus = !this.selectedFarmer.IsVerified;
    this.farmersService
      .verifyFarmer(this.selectedFarmer.FarmerId, newStatus)
      .subscribe({
        next: () => {
          this.selectedFarmer.IsVerified = newStatus;
          const idx = this.farmers.findIndex(
            (f) => f.FarmerId === this.selectedFarmer.FarmerId,
          );
          if (idx > -1) this.farmers[idx].IsVerified = newStatus;
          this.showSuccess(
            newStatus ? 'Farmer verified successfully' : 'Verification removed',
          );
        },
        error: () => this.showError('Could not update verification status'),
      });
  }

  // ─────────────────────────────────────────────────
  // Land management
  // ─────────────────────────────────────────────────

  editLand(land: any) {
    this.editingLandId = land.LandId;
    this.addLandMode = false;
    this.landEditForm = {
      landLocation: land.LandLocation || '',
      soilType: land.SoilType || '',
      waterSource: land.WaterSource || '',
      landUom: land.LandUom || '',
      latitude: land.Latitude || null,
      longitude: land.Longitude || null,
    };
  }

  cancelLandEdit() {
    this.editingLandId = null;
  }

  saveLand() {
    if (!this.landEditForm.landLocation?.trim())
      return this.showError('Location is required');
    this.isSavingLand = true;
    const payload = {
      landId: this.editingLandId,
      farmerId: this.selectedFarmer.FarmerId,
      landLocation: this.landEditForm.landLocation,
      soilType: this.landEditForm.soilType,
      waterSource: this.landEditForm.waterSource,
      landUom: this.landEditForm.landUom
        ? Number(this.landEditForm.landUom)
        : null,
      latitude: this.landEditForm.latitude
        ? Number(Number(this.newLandForm.latitude).toFixed(6))
        : null,
      longitude: this.landEditForm.longitude
        ? Number(Number(this.newLandForm.longitude).toFixed(6))
        : null,
      updatedBy: this.createdBy,
      // updatedBy: 1,
    };
    this.farmersService.saveLand(payload).subscribe({
      next: () => {
        this.isSavingLand = false;
        // Update local + bust cache
        const idx = this.lands.findIndex(
          (l) => l.LandId === this.editingLandId,
        );
        if (idx > -1) {
          this.lands[idx] = {
            ...this.lands[idx],
            ...{
              LandLocation: this.landEditForm.landLocation,
              SoilType: this.landEditForm.soilType,
              WaterSource: this.landEditForm.waterSource,
              LandUom: this.landEditForm.landUom,
              Latitude: this.landEditForm.latitude,
              Longitude: this.landEditForm.longitude,
            },
          };
        }
        this.landsCache.set(this.selectedFarmer.FarmerId, [...this.lands]);
        this.editingLandId = null;
        this.showSuccess('Land updated');
      },
      error: () => {
        this.isSavingLand = false;
        this.showError('Failed to save land');
      },
    });
  }

  openAddLandForm() {
    this.addLandMode = true;
    this.editingLandId = null;
    this.newLandForm = this.emptyLandForm();
  }

  saveNewLand() {
    if (!this.newLandForm.landLocation?.trim())
      return this.showError('Location is required');
    this.isSavingLand = true;
    const payload = {
      landId: 0,
      farmerId: this.selectedFarmer.FarmerId,
      landLocation: this.newLandForm.landLocation,
      soilType: this.newLandForm.soilType,
      waterSource: this.newLandForm.waterSource,
      landUom: this.newLandForm.landUom
        ? Number(this.newLandForm.landUom)
        : null,
      // landuom: 2,
      latitude: this.newLandForm.latitude
        ? Number(Number(this.newLandForm.latitude).toFixed(6))
        : null,
      longitude: this.newLandForm.longitude
        ? Number(Number(this.newLandForm.longitude).toFixed(6))
        : null,
      createdBy: this.createdBy,
      // createdBy: 1,
    };
    this.farmersService.saveLand(payload).subscribe({
      next: () => {
        this.isSavingLand = false;
        this.addLandMode = false;
        // Bust cache and reload lands
        this.landsCache.delete(this.selectedFarmer.FarmerId);
        this.loadLands(this.selectedFarmer.FarmerId);
        // Update land count on card
        const idx = this.farmers.findIndex(
          (f) => f.FarmerId === this.selectedFarmer.FarmerId,
        );
        if (idx > -1)
          this.farmers[idx].landCount = (this.farmers[idx].landCount || 0) + 1;
        this.showSuccess('Land added successfully');
      },
      error: () => {
        this.isSavingLand = false;
        this.showError('Failed to add land');
      },
    });
  }

  deleteLand(land: any) {
    Swal.fire({
      title: 'Delete this land?',
      text: `"${land.LandLocation}" will be removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.farmersService.deleteLand(land.LandId).subscribe({
        next: () => {
          this.lands = this.lands.filter((l) => l.LandId !== land.LandId);
          this.landsCache.set(this.selectedFarmer.FarmerId, [...this.lands]);
          const idx = this.farmers.findIndex(
            (f) => f.FarmerId === this.selectedFarmer.FarmerId,
          );
          if (idx > -1)
            this.farmers[idx].landCount = Math.max(
              0,
              (this.farmers[idx].landCount || 1) - 1,
            );
          this.showSuccess('Land removed');
        },
        error: () => this.showError('Could not delete land'),
      });
    });
  }

  openInMaps(lat: number, lng: number) {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }

  // ─────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────

  getInitials(name: string = ''): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getUomLabel(id: number): string {
    return this.uomList.find((u) => u.uomId === id)?.uomName ?? '';
  }

  private emptyFarmerForm() {
    return {
      name: '',
      phoneNumber: '',
      village: '',
      districtId: '',
      stateId: '',
      landSize: null as any,
    };
  }

  private emptyLandForm() {
    return {
      landLocation: '',
      soilType: '',
      waterSource: '',
      landUom: '' as any,
      latitude: null as any,
      longitude: null as any,
    };
  }

  private showSuccess(msg: string) {
    Swal.fire({
      icon: 'success',
      title: msg,
      timer: 2000,
      showConfirmButton: false,
      background: '#e8f5ee',
      confirmButtonColor: '#2d8653',
    });
  }

  private showError(msg: string) {
    Swal.fire({
      icon: 'error',
      title: 'Oops',
      text: msg,
      confirmButtonColor: '#dc3545',
    });
  }
}
