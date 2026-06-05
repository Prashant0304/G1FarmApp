import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InvestorService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboard(investorId: number) {
    return this.http.get(`${this.baseUrl}/Investor/dashboard/${investorId}`);
  }

  getProfile(investorId: number) {
    return this.http.get(
      `${this.baseUrl}/Investor/investor-profile/${investorId}`,
    );
  }

  getProjects(investorId: number) {
    return this.http.get(`${this.baseUrl}/Investor/investments/${investorId}`);
  }

  getCropAllocation(investorId: number) {
    return this.http.get(
      `${this.baseUrl}/Investor/crop-allocation/${investorId}`,
    );
  }

  getProjectDetail(projectInvestorId: number) {
    return this.http.get(
      `${this.baseUrl}/Investor/project/${projectInvestorId}`,
    );
  }

  getPaymentSchedule(investorId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/Investor/payment-schedule/${investorId}`,
    );
  }
}
