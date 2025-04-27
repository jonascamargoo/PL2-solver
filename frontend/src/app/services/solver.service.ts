import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolverService {

  private apiUrl = 'http://localhost:8000/api/solve/';

  constructor(private http: HttpClient) {}

  solveProblem(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

}