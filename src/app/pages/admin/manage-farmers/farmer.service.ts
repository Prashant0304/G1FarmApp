import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FarmerService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFarmers(
    search = '',
    pageNumber = 1,
    pageSize = 5,
    isVerified: boolean | null = null,
  ): Observable<any> {
    let params = new HttpParams()
      .set('search', search)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (isVerified !== null) params = params.set('isVerified', isVerified);
    return this.http.get(`${this.base}/Farmer/get-all-farmers`, { params });
  }

  getLandsByFarmerId(farmerId: number): Observable<any> {
    return this.http.get(`${this.base}/Farmer/get-lands-by-farmerid`, {
      params: { farmerId },
    });
  }

  saveFarmer(payload: any): Observable<any> {
    return this.http.post(`${this.base}/Farmer/update-farmer`, payload);
  }

  verifyFarmer(farmerId: number, isVerified: boolean): Observable<any> {
    return this.http.post(`${this.base}/Farmer/verify`, {
      farmerId,
      isVerified,
    });
  }

  saveLand(payload: any): Observable<any> {
    return this.http.post(`${this.base}/Farmer/save-or-update-land`, payload);
  }

  deleteLand(landId: number): Observable<any> {
    return this.http.post(
      `${this.base}/Farmer/Delete-Land-By-LandId?landId=${landId}`,
      {},
    );
  }

  getStates(): Observable<any> {
    return this.http.get(`${this.base}/Master/states`);
  }

  getLandUom(): Observable<any> {
    return this.http.get(`${this.base}/Master/land-uom`);
  }

  getDistrictsByState(stateId: number): Observable<any> {
    return this.http.get(`${this.base}/Master/districts/${stateId}`);
  }
}
