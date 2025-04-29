import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SolverRequest {
  objective: 'max' | 'min';
  objective_func: number[];
  constraints: { coefficients: number[]; operator: string; valor: number }[];
}

export interface BaseSolverResponse {
  status: string;
  optimal_value?: number;
  variables?: { [key: string]: number };
  error?: string;
}

export interface PlotDataResponse extends BaseSolverResponse {
  feasible_region_vertices?: number[][]; // Array de arrays [x, y]
  constraint_lines?: ConstraintLineData[]; // Array de dados das linhas (opcional)
}

export interface ConstraintLineData {
  label: string;
  x: number[];
  y: number[];
}


@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private solveUrl = 'http://127.0.0.1:8000/api/solve/';
  private solveAndPlotUrl = 'http://127.0.0.1:8000/api/solve_and_plot/'; // NOVO ENDPOINT (exemplo)

  constructor(private http: HttpClient) { }

  // Método existente para solução matemática
  solve(problemData: SolverRequest): Observable<BaseSolverResponse> {
    console.log('Enviando para (solve):', problemData);
    return this.http.post<BaseSolverResponse>(this.solveUrl, problemData).pipe(
      catchError(this.handleError)
    );
  }

  // NOVO método para obter dados de plotagem
  solveAndGetPlotData(problemData: SolverRequest): Observable<PlotDataResponse> {
    console.log('Enviando para (solve_and_plot):', problemData);
    return this.http.post<PlotDataResponse>(this.solveAndPlotUrl, problemData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido na comunicação com o servidor!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro de cliente: ${error.error.message}`;
    } else {
      console.error(
        `Backend retornou código ${error.status}, ` +
        `body era:`, error.error);
      // Tenta pegar a mensagem de erro do backend, se existir
      const backendError = error.error?.error || error.error?.detail || error.message;
      errorMessage = `Erro do servidor (${error.status}): ${backendError}`;
    }
    // Retorna um observable com uma mensagem de erro amigável
    // Usando a estrutura esperada pela interface BaseSolverResponse para erro
    return throwError(() => ({
        status: 'Erro na comunicação',
        error: errorMessage
    } as BaseSolverResponse )); // Retorna um erro estruturado
  }
}