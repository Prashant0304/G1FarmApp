import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RegisterInvestorResponse {
  success: boolean;
  message: string;
  password: string;
}

export interface IfscDetails {
  BANK: string;
  BRANCH: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  IFSC: string;
}

@Injectable({
  providedIn: 'root',
})
export class InvestorService {
  private readonly apiBase = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registerInvestor(formData: FormData): Observable<RegisterInvestorResponse> {
    return this.http.post<RegisterInvestorResponse>(
      `${this.apiBase}/Investor/register`,
      formData,
    );
  }
}
