import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

const BASE = environment.apiUrl;

export interface CropItem {
  CropId: number;
  CropKey: string;
  CropName: string;
  GrowthDurationDays: number;
  DefaultUomId: number;
  CategoryKey: string;
}

export interface CropsResponse {
  data: CropItem[];
  total: number;
}

export interface InvestorItem {
  InvestorId: number;
  Name: string;
  Email?: string;
  MobileNumber?: string;
}

export interface CreateProjectRequestDto {
  ProjectCode?: string;
  LandId: number;
  ProjectName?: string;
  StartDate: string;
  EndDate: string;
  EstimatedInvestment: number;
  PaymentFrequency?: string;
  TotalPlants: number;
  Status?: string;
  CreatedBy: string;
}

export interface ProjectCropDto {
  CropId: number;
  PlantCount: number;
  CostPerPlant: number;
  EstimatedYieldKg: number;
  ExpectedHarvestDate: string;
  TotalEstimatedCost: number;
}

export interface SaveProjectCropsRequestDto {
  ProjectId: number;
  CreatedBy: string;
  Crops: ProjectCropDto[];
}

export interface ProjectInvestorDto {
  InvestorId: number;
  ProjectCropId: number;
  PlantCount: number;
  AmountInvested: number;
  InvestmentDate: string;
  PaymentFrequency: string;
  InstallmentCount: number;
  InstallmentAmount: number;
  Status: string;
}

export interface SaveProjectInvestorsRequestDto {
  ProjectId: number;
  Investors: ProjectInvestorDto[];
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}

  getCrops(search: string = '', pageNumber = 1, pageSize = 20): Observable<CropsResponse> {
    let params = new HttpParams()
      .set('lang', 2)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<CropsResponse>(`${BASE}/Crop`, { params });
  }

  searchInvestors(search?: string): Observable<{ success: boolean; data: InvestorItem[] }> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<{ success: boolean; data: InvestorItem[] }>(
      `${BASE}/Project/search-investors`, { params }
    );
  }

  createProject(body: CreateProjectRequestDto): Observable<{ success: boolean; projectId: number; projectName: string }> {
    return this.http.post<{ success: boolean; projectId: number; projectName: string }>(
      `${BASE}/Project/create`, body
    );
  }

  addProjectCrops(body: SaveProjectCropsRequestDto): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${BASE}/Project/add-project-crops`, body
    );
  }

  addProjectInvestors(body: SaveProjectInvestorsRequestDto): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${BASE}/Project/add-project-investors`, body
    );
  }

  getProjectCrops(projectId: number): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(
      `${BASE}/Project/get-project-crops`, { params: new HttpParams().set('projectId', projectId) }
    );
  }

  getLands(search: string = ''): Observable<{ success: boolean; data: any[] }> {

  let params = new HttpParams();

  if (search) {
    params = params.set('searchText', search);
  }

  return this.http.post<{ success: boolean; data: any[] }>(
    `${BASE}/Project/get-all-lands`,
    {}, // empty body
    { params } // options
  );
}
}