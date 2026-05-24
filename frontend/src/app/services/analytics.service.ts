import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsFilters {
  brand?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) {}

  private buildParams(filters: AnalyticsFilters): HttpParams {
    let params = new HttpParams();
    if (filters.brand && filters.brand !== 'all') params = params.set('brand', filters.brand);
    if (filters.year_min) params = params.set('year_min', filters.year_min);
    if (filters.year_max) params = params.set('year_max', filters.year_max);
    if (filters.price_min) params = params.set('price_min', filters.price_min);
    if (filters.price_max) params = params.set('price_max', filters.price_max);
    return params;
  }

  getBrands(filters: AnalyticsFilters = {}): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/analytics/brands`, { params: this.buildParams(filters) });
  }
  getTransmissions(filters: AnalyticsFilters = {}): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/analytics/transmissions`, { params: this.buildParams(filters) });
  }
  getFuelTypes(filters: AnalyticsFilters = {}): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/analytics/fuel-types`, { params: this.buildParams(filters) });
  }
  getMileage(filters: AnalyticsFilters = {}): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/analytics/mileage`, { params: this.buildParams(filters) });
  }
  getClusters(filters: AnalyticsFilters = {}): Observable<{ cluster_counts: Record<string, number> }> {
    return this.http.get<{ cluster_counts: Record<string, number> }>(`${this.apiUrl}/analytics/clusters`, { params: this.buildParams(filters) });
  }
}