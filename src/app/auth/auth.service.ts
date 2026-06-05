import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Send OTP ────────────────────────────────
  sendOtp(phoneNumber: string) {
    return this.http.post(`${this.baseUrl}/Auth/send-otp`, {
      phoneNumber,
    });
  }

  // ── Resend OTP ──────────────────────────────
  resendOtp(phoneNumber: string) {
    return this.http.post(`${this.baseUrl}/Auth/resend-otp`, {
      phoneNumber,
    });
  }

  // ── Verify OTP ──────────────────────────────
  verifyOtp(phoneNumber: string, otp: string) {
    return this.http.post<any>(`${this.baseUrl}/Auth/verify-otp`, {
      phoneNumber,
      otp,
    });
  }

  // ── Fetch Farmer by Phone ───────────────────
  getFarmerByPhone(phoneNumber: string) {
    return this.http.post<any>(`${this.baseUrl}/Farmer/get-by-phone`, {
      phoneNumber,
    });
  }

  // ── Session Helpers ─────────────────────────
  saveSession(farmerId: number, farmerName: string, phone: string): void {
    localStorage.setItem('farmerId', String(farmerId));
    localStorage.setItem('farmerName', farmerName);
    localStorage.setItem('farmerPhone', phone);
  }

  clearSession(): void {
    localStorage.removeItem('farmerId');
    localStorage.removeItem('farmerName');
    localStorage.removeItem('farmerPhone');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('farmerId');
  }

  getFarmerId(): number | null {
    const id = localStorage.getItem('farmerId');
    return id ? Number(id) : null;
  }

  getFarmerName(): string {
    return localStorage.getItem('farmerName') || '';
  }

  adminLogin(data: any) {
    return this.http.post<any>(`${this.baseUrl}/Auth/admin-login`, data);
  }

  // ─────────────────────────────────────────
  // ADMIN SESSION
  // ─────────────────────────────────────────

  saveAdminSession(admin: any): void {
    localStorage.setItem('adminData', JSON.stringify(admin));
  }

  isAdminLoggedIn(): boolean {
    return !!localStorage.getItem('adminData');
  }

  clearAdminSession(): void {
    localStorage.removeItem('adminData');
  }

  investorlogin(data: any) {
    return this.http.post(`${this.baseUrl}/Investor/investor-login`, data);
  }
}
