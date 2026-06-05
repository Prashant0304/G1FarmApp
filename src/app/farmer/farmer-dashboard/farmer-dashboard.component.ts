import { Component, signal } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Router } from '@angular/router';
import { WeatherService } from './weather.service';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: false,
  templateUrl: './farmer-dashboard.component.html',
  styleUrls: ['./farmer-dashboard.component.css'],
})
export class FarmerDashboardComponent {
  user = signal<any>(null);
  lands = signal<any[]>([]);
  weather = signal<any>(null);
  uomList = signal<any[]>([]);
  isLoading = signal(true);
  activeMenu = signal<'dashboard' | 'lands' | 'profile'>('dashboard');
  sidebarOpen = signal(false);

  profile = signal<any>(null);

  today = new Date();
  showAddLandForm = false;

  newLand: any = {
    landLocation: '',
    soilType: '',
    waterSource: '',
    landSize: null,
    uomId: 1,
    latitude: null,
    longitude: null,
    districtId: null,
    stateId: null,
    hobliId: null,
  };
  districts: any[] = [];
  state: any[] = [];
  hobli: any[] = [];
  constructor(
    private dashboardService: DashboardService,
    private weatherService: WeatherService,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const farmerId = this.getFarmerId();

    if (!farmerId) {
      this.router.navigate(['/register']);
      return;
    }

    this.dashboardService.getDashboard(farmerId).subscribe({
      next: (res) => {
        console.log('Dashboard API:', res);

        this.user.set(res);

        this.isLoading.set(false);

        const firstLand = res.lands?.[0];

        if (firstLand?.latitude && firstLand?.longitude) {
          this.fetchWeather(firstLand.latitude, firstLand.longitude);
        } else {
          this.fetchWeatherFromGPS();
        }
      },

      error: (err) => {
        console.error(err);
        this.router.navigate(['/register']);
      },
    });
  }

  loadUOM(): void {
    this.dashboardService.getLandUOM().subscribe({
      next: (res) => {
        console.log('UOM LIST:', res);

        this.uomList.set(res);
        this.showAddLandForm = !this.showAddLandForm;
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  onClickshowAddLandForm(): void {
    this.loadUOM();

    this.dashboardService.getStates().subscribe({
      next: (res) => {
        this.state = res;
        this.showAddLandForm = true;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onStateChange(): void {
    const stateId = this.newLand.stateId;

    this.districts = [];
    this.hobli = [];
    this.newLand.districtId = null;
    this.newLand.hobliId = null;

    if (!stateId) return;

    this.dashboardService.getDistricts(stateId).subscribe({
      next: (res) => {
        this.districts = res;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  onDistrictChange(): void {
    const districtId = this.newLand.districtId;

    this.hobli = [];
    this.newLand.hobliId = null;

    if (!districtId) return;

    this.dashboardService.getHobli(districtId).subscribe({
      next: (res) => {
        this.hobli = res;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  private loadProfile(farmerId: number): void {
    this.dashboardService.getProfile(farmerId).subscribe({
      next: (res) => {
        console.log('Profile API:', res);

        this.profile.set(res);
      },

      error: (err) => {
        console.error('Profile error:', err);
      },
    });
  }

  private getFarmerId(): number | null {
    const id = localStorage.getItem('farmerId');
    return id ? Number(id) : null;
  }

  private fetchWeather(lat: number, lon: number): void {
    this.weatherService.getWeather(lat, lon).subscribe({
      next: (res: any) => {
        console.log('Weather:', res);
        this.weather.set(res);
      },
      error: (err) => console.error('Weather error:', err),
    });
  }

  private fetchWeatherFromGPS(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      this.fetchWeather(pos.coords.latitude, pos.coords.longitude);
    });
  }

  // setMenu(menu: 'dashboard' | 'lands' | 'profile'): void {
  //   this.activeMenu.set(menu);
  //   const farmerId = this.getFarmerId();

  //   if (menu === 'lands' && this.lands().length === 0 && farmerId) {
  //     this.dashboardService.getLandsByFarmerId(farmerId).subscribe({
  //       next: (res) => {
  //         console.log('Lands:', res);

  //         this.lands.set(res);
  //       },

  //       error: (err) => {
  //         console.error('Land API Error:', err);
  //       },
  //     });
  //   }
  //   if (menu === 'profile' && !this.profile()) {
  //     if (farmerId) {
  //       this.loadProfile(farmerId);
  //     }
  //   }

  //   this.sidebarOpen.set(false);
  // }

  setMenu(menu: 'dashboard' | 'lands' | 'profile'): void {
    this.activeMenu.set(menu);

    const farmerId = this.getFarmerId();

    if (!farmerId) return;

    // ================= DASHBOARD =================
    if (menu === 'dashboard') {
      this.isLoading.set(true);

      this.dashboardService.getDashboard(farmerId).subscribe({
        next: (res) => {
          console.log('Dashboard API:', res);

          this.user.set(res);

          this.isLoading.set(false);

          const firstLand = res.lands?.[0];

          if (firstLand?.latitude && firstLand?.longitude) {
            this.fetchWeather(firstLand.latitude, firstLand.longitude);
          }
        },

        error: (err) => {
          console.error('Dashboard API Error:', err);
          this.isLoading.set(false);
        },
      });
    }

    // ================= LANDS =================
    if (menu === 'lands') {
      this.dashboardService.getLandsByFarmerId(farmerId).subscribe({
        next: (res) => {
          console.log('Lands API:', res);

          this.lands.set(res);
        },

        error: (err) => {
          console.error('Land API Error:', err);
        },
      });
    }

    // ================= PROFILE =================
    if (menu === 'profile') {
      this.loadProfile(farmerId);
    }

    this.sidebarOpen.set(false);
  }
  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to log out of G1Farm?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2e7d32', // Emerald green theme matching your sidebar navigation active background
      cancelButtonColor: '#e71004', // Crimson red matching your cancel form button
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      background: '#0d2b1a', // Deep dark-green palette matching your sidebar background
      color: '#ffffff', // High-contrast crisp white typography
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear tokens and backend session data
        this.authService.clearSession();
        localStorage.clear();

        Swal.fire({
          title: 'Logged Out!',
          text: 'You have successfully signed out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#0d2b1a',
          color: '#ffffff',
        });

        this.router.navigate(['/auth/farmer-login']);
      }
    });
  }

  // ✅ GREETING
  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  cancelLand(): void {
    this.showAddLandForm = false;

    this.newLand = {
      landLocation: '',
      soilType: '',
      waterSource: '',
      landSize: null,
      uomId: 1,
      latitude: null,
      longitude: null,
      stateId: null,
      districtId: null,
      hobliId: null,
    };

    this.districts = [];
    this.hobli = [];
  }

  addLand(): void {
    const farmerId = this.getFarmerId();

    const payload = {
      farmerId: farmerId,
      landLocation: this.newLand.landLocation,
      soilType: this.newLand.soilType,
      waterSource: this.newLand.waterSource,
      landSize: this.newLand.landSize,
      uomId: this.newLand.uomId,
      latitude: this.newLand.latitude,
      longitude: this.newLand.longitude,
      stateId: this.newLand.stateId,
      districtId: this.newLand.districtId,
      hobliId: this.newLand.hobliId,
    };

    this.dashboardService.addLand(payload).subscribe({
      next: (res) => {
        console.log('Land Added', res);

        this.showAddLandForm = false;

        // reload latest lands
        this.loadLands();

        // reset form
        this.newLand = {
          landLocation: '',
          soilType: '',
          waterSource: '',
          landSize: null,
          uomId: 1,
          latitude: null,
          longitude: null,
        };
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  loadLands(): void {
    const farmerId = this.getFarmerId();

    if (!farmerId) return;

    this.dashboardService.getLandsByFarmerId(farmerId).subscribe({
      next: (res) => {
        this.lands.set(res);
      },

      error: (err) => {
        console.error(err);
      },
    });
  }
}
