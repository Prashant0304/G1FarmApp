import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFarmers(search: string, pageNumber = 1, pageSize = 10) {
    return this.http.get(`${this.baseUrl}/farmer/search`, {
      params: {
        search,
        pageNumber,
        pageSize,
      },
    });
  }

  getCrops(
    lang = 'en',
    search = '',
    pageNumber = 1,
    pageSize = 50,
  ): Observable<any> {
    let params = new HttpParams()
      .set('lang', lang)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('search', search);

    return this.http.get(`${this.baseUrl}/crop`, { params });
  }

  getLandsByFarmerId(farmerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Contract/get-landid`, {
      params: { farmerId },
    });
  }

  saveContract(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Contract/save`, payload);
  }

  getContracts(
    lang = '',
    search = '',
    pageNumber = 1,
    pageSize = 10,
  ): Observable<any> {
    let params = new HttpParams()
      .set('lang', lang)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('search', search);

    return this.http.get(`${this.baseUrl}/Contract`, { params });
  }

  getContractById(contractId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/Contract/get-contract-byid?contractId=${contractId}`,
    );
  }
}
