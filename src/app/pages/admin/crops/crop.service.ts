import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CropService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCrops(
    lang = '2',
    search = '',
    pageNumber = 1,
    pageSize = 12,
  ): Observable<any> {
    const params = new HttpParams()
      .set('lang', lang)
      .set('search', search)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get(`${this.base}/Crop`, { params });
  }

  saveCrop(payload: any): Observable<any> {
    return this.http.post(`${this.base}/Crop/save-crop-with-stage`, payload);
  }

  getStagesByCropId(cropId: number): Observable<any> {
    return this.http.get(`${this.base}/Crop/get-crop-stages`, {
      params: { cropId },
    });
  }

  deleteStage(stageId: number): Observable<any> {
    return this.http.delete(`${this.base}/Crop/Delete-crop-stage/${stageId}`);
  }
}
