import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Counts / totals ──
  // Adjust endpoints to match your actual API routes

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.base}/dashboard/dashboard/stats`);
  }

  getCropDistribution(lang: string): Observable<any> {
    return this.http.get(
      `${this.base}/dashboard/crop-distribution?languageCode=${lang}`,
    );
  }

  // ── Lists ──

  getRecentContracts(lang = '2', pageSize = 10): Observable<any> {
    const params = new HttpParams()
      .set('lang', lang)
      .set('pageNumber', 1)
      .set('pageSize', pageSize)
      .set('search', '');
    return this.http.get(`${this.base}/Contract`, { params });
  }

  getCrops(lang = '2', pageSize = 50): Observable<any> {
    const params = new HttpParams()
      .set('lang', lang)
      .set('pageNumber', 1)
      .set('pageSize', pageSize)
      .set('search', '');
    return this.http.get(`${this.base}/crop`, { params });
  }

  getFarmerUpdates(pageSize = 5): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', 1)
      .set('pageSize', pageSize);
    return this.http.get(`${this.base}/farmerupdate`, { params });
  }
}
