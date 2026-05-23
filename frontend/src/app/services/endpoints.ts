import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Endpoints {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  predict(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/predict`, data);
  }

  evaluate(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/evaluate`, data);
  }

  compare(car1: any, car2: any, weights?: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/compare`, {
      car1: car1,
      car2: car2,
      weights: weights
    });
  }
}