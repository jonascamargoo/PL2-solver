// src/app/solver.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface para os dados enviados ao backend
export interface SolverRequest {
  objective: 'max' | 'min'; // Tipagem mais estrita
  objective_func: number[];
  constraints: { coefficients: number[]; operator: string; valor: number }[];
}

// Interface para a resposta do backend
export interface SolverResponse {
  variables: { [key: string]: number };
  optimal_value: number;
  status: string; // Ex: "Optimal", "Infeasible", "Unbounded", "Error"
  error?: string; // Opcional, caso o backend retorne um erro específico
}

@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private apiUrl = 'http://127.0.0.1:8000/api/solve/';

  constructor(private http: HttpClient) { }

  solve(problemData: SolverRequest): Observable<SolverResponse> {
    console.log('Enviando para o backend:', problemData); // Log para depuração
    return this.http.post<SolverResponse>(this.apiUrl, problemData).pipe(
      catchError(this.handleError) // Adiciona tratamento de erro HTTP
    );
  }

  // Método privado para tratar erros HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // O backend retornou um código de falha
      // O corpo da resposta pode conter pistas sobre o que deu errado
      console.error(
        `Backend retornou código ${error.status}, ` +
        `body era:`, error.error);
      // Tenta pegar a mensagem de erro do backend, se existir
      errorMessage = `Erro do servidor: ${error.status}. ${error.error?.error || error.message}`;
      // Se o backend retornar uma estrutura específica de erro, ajuste aqui
      // Ex: if (error.error && error.error.detail) errorMessage = error.error.detail;
    }
    // Retorna um observable com uma mensagem de erro amigável
    return throwError(() => new Error(errorMessage));
  }
}