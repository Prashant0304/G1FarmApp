import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLangauges(): Observable<any> {
    return this.http.get(this.baseUrl + '/Master/languages');
  }

  getMenus(roleId: number, languageCode: string): Observable<any> {
    const params = new HttpParams()
      .set('roleId', roleId)
      .set('languageCode', languageCode);
    return this.http.get(`${this.baseUrl}/Master/menus`, { params });
  }
}
