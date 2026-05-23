import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CarDetails {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineSize: number;
  mpg: number;
  price?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarDataService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getBrands(): Observable<{ brands: string[] }> {
    return this.http.get<{ brands: string[] }>(`${this.apiUrl}/cars/brands`);
  }

  getModels(brand: string): Observable<{ models: string[] }> {
    return this.http.get<{ models: string[] }>(`${this.apiUrl}/cars/models/${brand}`);
  }

  getYears(brand: string, model: string): Observable<{ years: number[] }> {
    return this.http.get<{ years: number[] }>(`${this.apiUrl}/cars/years/${brand}/${model}`);
  }

  getCarDetails(brand: string, model: string, year: number): Observable<CarDetails> {
    return this.http.get<CarDetails>(`${this.apiUrl}/cars/details/${brand}/${model}/${year}`);
  }
}