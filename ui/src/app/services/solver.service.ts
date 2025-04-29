import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SolverRequest {
  objective: string;
  objective_func: number[];
  constraints: { coefficients: number[]; operator: string; valor: number }[];
}

interface SolverResponse {
  variaveis: { [key: string]: number };
  valor_otimo: number;
  status: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private apiUrl = 'http://127.0.0.1:8000/api/solve/';

  constructor(private http: HttpClient) { }

  solve(problemData: SolverRequest): Observable<SolverResponse> {
    return this.http.post<SolverResponse>(this.apiUrl, problemData);
  }

  
}