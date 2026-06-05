import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) {}

  getDashboard(farmerId: number) {
    return this.http.get<any>(
      `${this.baseUrl}/Dashboard/get-dashboard/${farmerId}`,
    );
  }
  // ✅ Get Farmer Basic Details
  getFarmerById(farmerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/farmers/${farmerId}`);
  }

  getProfile(farmerId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/Dashboard/get-profile/${farmerId}`,
    );
  }

  // ✅ Get Farmer Land Details
  getFarmerLands(farmerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/farmer-lands/${farmerId}`);
  }

  getLandsByFarmerId(farmerId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/Dashboard/getlandsbyfarmerId/${farmerId}`,
    );
  }

  addLand(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Farmer/add-land`, data);
  }

  getLandUOM(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Master/land-uom`);
  }

  getStates() {
    return this.http.get<any[]>(`${this.baseUrl}/Master/states`);
  }
  getDistricts(StateId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/Master/districts/${StateId}`);
  }

  getHobli(DistrictId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/Master/hobli/${DistrictId}`);
  }

  logout(): void {
    // Clear session
    this.authService.clearSession();

    // Redirect to login page
    this.router.navigate(['auth/farmer-login']);
  }
}
