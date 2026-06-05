import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
export class IfscService {
  private readonly razorpayBase = 'https://ifsc.razorpay.com';

  constructor(private http: HttpClient) {}

  getBranchDetails(ifscCode: string): Observable<IfscDetails> {
    return this.http.get<IfscDetails>(
      `${this.razorpayBase}/${ifscCode.toUpperCase()}`,
    );
  }
}
