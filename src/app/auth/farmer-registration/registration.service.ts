import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFarmers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/farmers`);
  }

  addFarmer(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Farmer/register`, data);
  }

  addFarmerDetails(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Farmer/insertlanddetails`, data);
  }

  updateFarmerDetails(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/farmer`, data);
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

  sendOtp(phone: any) {
    return this.http.post(`${this.baseUrl}/Auth/send-otp`, {
      phoneNumber: phone,
    });
  }

  resendOtp(phone: any) {
    return this.http.post(`${this.baseUrl}/Auth/resend-otp`, {
      phoneNumber: phone,
    });
  }

  verifyOtp(data: any) {
    return this.http.post(`${this.baseUrl}/Auth/verify-otp`, data);
  }

  getLandUOM(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Master/land-uom`);
  }
}
