import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  SolverService,
  SolverRequest,
  BaseSolverResponse,
  PlotDataResponse,
  ConstraintLineData
} from './solver.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import Plotly from 'plotly.js-dist-min';
import { Data, Layout } from 'plotly.js-dist-min';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('plotlyGraph') plotlyGraph!: ElementRef;

  linearProgrammingForm!: FormGroup;
  objectiveOptions: string[] = ['Maximizar', 'Minimizar'];
  operatorOptions: string[] = ['≤', '≥'];
  isLoading = false; // Estado de carregamento
  mathematicalSolution: BaseSolverResponse | null = null;
  graphRendered = false; // Indica se um gráfico foi renderizado
  // Guarda a resposta completa para o gráfico
  plotData: PlotDataResponse | null = null;


  private destroy$ = new Subject<void>(); // Para cancelar subscriptions

  public objectKeys = Object.keys;

  constructor(
    private fb: FormBuilder,
    private solverService: SolverService, // Injete o serviço
    private snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearGraph();
  }


  initForm(): void {
    this.linearProgrammingForm = this.fb.group({
      objective: ['Maximizar', Validators.required],
      objectiveCoefficients: this.fb.array([
        this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]),
        this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)])
      ]),
      constraints: this.fb.array([
        this.createConstraint(),
        this.createConstraint()
      ])
    });
  }

  createConstraint(): FormGroup {
    return this.fb.group({
      coefficients: this.fb.array([
        this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]),
        this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)])
      ]),
      operator: ['≤', Validators.required],
      value: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]] // Nome original do form
    });
  }

  // Getters para facilitar o acesso no template e no código
  get objectiveCoefficients(): FormArray<FormControl> {
    return this.linearProgrammingForm.get('objectiveCoefficients') as FormArray<FormControl>;
  }

  get constraints(): FormArray<FormGroup> {
    return this.linearProgrammingForm.get('constraints') as FormArray<FormGroup>;
  }

  getConstraintCoefficients(index: number): FormArray<FormControl> {
    return this.constraints.at(index).get('coefficients') as FormArray<FormControl>;
  }

  addConstraint(): void {
    if (this.constraints.length < 10) {
      this.constraints.push(this.createConstraint());
    } else {
      this.snackBar.open('Máximo de 10 restrições atingido', 'Fechar', { duration: 3000 });
    }
  }

  removeConstraint(): void {
    if (this.constraints.length > 2) { 
      this.constraints.removeAt(this.constraints.length - 1);
    } else {
      this.snackBar.open('Deve haver pelo menos duas restrições', 'Fechar', { duration: 3000 });
    }
  }

  private prepareRequestData(): SolverRequest | null {
    if (!this.linearProgrammingForm.valid) {
      this.markFormGroupTouched(this.linearProgrammingForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', { duration: 3000 });
      return null;
    }

    const formData = this.linearProgrammingForm.getRawValue(); 
    const requestData: SolverRequest = {
      objective: formData.objective === 'Maximizar' ? 'max' : 'min',
      objective_func: formData.objectiveCoefficients.map(Number),
      constraints: formData.constraints.map((constraint: any) => ({
        coefficients: constraint.coefficients.map(Number),
        operator: constraint.operator === '≤' ? '<=' : '>=',
        valor: Number(constraint.value)
      })),
    };

    if (!requestData.constraints || requestData.constraints.length === 0) {
      this.snackBar.open('Adicione pelo menos uma restrição.', 'Fechar', { duration: 3000 });
      return null;
    }

    return requestData;
  }

  solveGraphically(): void {
    const requestData = this.prepareRequestData();
    if (!requestData) return;

    this.isLoading = true;
    this.mathematicalSolution = null; 
    this.plotData = null; 
    this.clearGraph();

    this.solverService.solveAndGetPlotData(requestData) 
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Resposta do Backend (Gráfico):', response);
          this.plotData = response; 

          if (response.status === 'Optimal' && response.feasible_region_vertices && response.variables) {
            this.plotFeasibleRegion(response); 
            this.snackBar.open(`Solução ótima encontrada! Gráfico plotado. Valor: ${response.optimal_value}`, 'OK', { duration: 4000 });
          } else {
            this.handleNonOptimalResponse(response); // Reutiliza o handler
            if (response.constraint_lines && response.constraint_lines.length > 0) {
              console.log("Tentando plotar apenas as linhas de restrição para status não ótimo.");
              this.plotConstraintLinesOnly(response.constraint_lines);
            }
          }
        },
        error: (err: BaseSolverResponse) => {
          console.error('Erro ao chamar o serviço (Gráfico):', err);
          this.handleNonOptimalResponse(err); 
          this.clearGraph();
        }
      });
  }

  solveMathematically(): void {
    const requestData = this.prepareRequestData();
    if (!requestData) return;

    this.isLoading = true;
    this.mathematicalSolution = null;
    this.plotData = null;
    this.clearGraph();

    this.solverService.solve(requestData) 
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Resposta do Backend (Matemático):', response);
          this.mathematicalSolution = response; 
          if (response.status === 'Optimal') {
            this.snackBar.open(`Solução ótima encontrada! Valor: ${response.optimal_value}`, 'OK', { duration: 4000 });
          } else {
            this.handleNonOptimalResponse(response);
          }
        },
        error: (err: BaseSolverResponse) => {
          console.error('Erro ao chamar o serviço (Matemático):', err);
          this.mathematicalSolution = err; 
          this.handleNonOptimalResponse(err); 
        }
      });
  }

  private plotFeasibleRegion(data: PlotDataResponse): void {
    if (!this.plotlyGraph?.nativeElement || !data.feasible_region_vertices || !data.variables) {
      console.error("Dados insuficientes ou elemento do gráfico não encontrado para plotar região.");
      this.snackBar.open("Erro ao renderizar gráfico: dados incompletos.", "Fechar", { duration: 3000 });
      return;
    }

    const plotTraces: Partial<Data>[] = [];
    const regionVertices = data.feasible_region_vertices;
    if (regionVertices.length > 1) {
      regionVertices.push([...regionVertices[0]]);
    }
    plotTraces.push({
      x: regionVertices.map(p => p[0]),
      y: regionVertices.map(p => p[1]),
      fill: 'toself',
      fillcolor: 'rgba(0, 176, 246, 0.3)',
      line: { color: 'rgba(0, 176, 246, 0.8)' },
      type: 'scatter',
      mode: 'lines',
      name: 'Região Factível'
    });

    if (data.constraint_lines && data.constraint_lines.length > 0) {
      data.constraint_lines.forEach(line => {
        plotTraces.push({
          x: line.x,
          y: line.y,
          mode: 'lines',
          type: 'scatter',
          name: line.label,
          line: { dash: 'dash', width: 1.5 }
        });
      });
    } else {
      console.warn("Dados das linhas de restrição não fornecidos pelo backend.");
    }


    // 3. Trace para o Ponto Ótimo
    const optimal_x1 = data.variables['x1'] ?? 0;
    const optimal_x2 = data.variables['x2'] ?? 0;
    plotTraces.push({
      x: [optimal_x1],
      y: [optimal_x2],
      mode: 'markers',
      type: 'scatter',
      name: `Ponto Ótimo (${optimal_x1.toFixed(2)}, ${optimal_x2.toFixed(2)})`,
      marker: { color: 'red', size: 12, symbol: 'star' }
    });

    let all_x = regionVertices.map(p => p[0]);
    let all_y = regionVertices.map(p => p[1]);
    all_x.push(optimal_x1);
    all_y.push(optimal_x2);
    all_x.push(0);
    all_y.push(0);
    if (data.constraint_lines) {
      data.constraint_lines.forEach(l => { all_x.push(...l.x); all_y.push(...l.y); });
    }


    const minX = Math.min(...all_x);
    const maxX = Math.max(...all_x);
    const minY = Math.min(...all_y);
    const maxY = Math.max(...all_y);
    const paddingX = (maxX - minX) * 0.1 + 1;
    const paddingY = (maxY - minY) * 0.1 + 1;


    const layout: Partial<Layout> = {
      title: `Solução Gráfica (${data.status}) - Valor Ótimo: ${data.optimal_value?.toFixed(2) ?? 'N/A'}`,
      xaxis: { title: 'X₁', range: [minX - paddingX, maxX + paddingX] },
      yaxis: { title: 'X₂', range: [minY - paddingY, maxY + paddingY] },
      showlegend: true,
      legend: { x: 1.05, y: 1 },
      hovermode: 'closest'
    };

    Plotly.newPlot(this.plotlyGraph.nativeElement, plotTraces, layout, { responsive: true })
      .then(() => {
        this.graphRendered = true;
        console.log("Gráfico Plotly (Região Factível) renderizado.");
      })
      .catch(err => {
        console.error("Erro ao renderizar Plotly (Região Factível):", err);
        this.snackBar.open("Erro interno ao gerar o gráfico da região factível.", "Fechar", { duration: 3000 });
      });
  }

  private plotConstraintLinesOnly(lines: ConstraintLineData[]): void {
    if (!this.plotlyGraph?.nativeElement) return;

    const plotTraces: Partial<Data>[] = [];
    let all_x: number[] = [0];
    let all_y: number[] = [0];

    lines.forEach(line => {
      plotTraces.push({
        x: line.x,
        y: line.y,
        mode: 'lines',
        type: 'scatter',
        name: line.label,
        line: { dash: 'dash', width: 1.5 }
      });
      all_x.push(...line.x);
      all_y.push(...line.y);
    });

    const minX = Math.min(...all_x);
    const maxX = Math.max(...all_x);
    const minY = Math.min(...all_y);
    const maxY = Math.max(...all_y);
    const paddingX = (maxX - minX) * 0.1 + 1;
    const paddingY = (maxY - minY) * 0.1 + 1;

    const layout: Partial<Layout> = {
      title: `Linhas de Restrição (Status: ${this.plotData?.status ?? 'N/A'})`,
      xaxis: { title: 'X₁', range: [minX - paddingX, maxX + paddingX] },
      yaxis: { title: 'X₂', range: [minY - paddingY, maxY + paddingY] },
      showlegend: true,
      legend: { x: 1.05, y: 1 },
      hovermode: 'closest'
    };

    Plotly.newPlot(this.plotlyGraph.nativeElement, plotTraces, layout, { responsive: true })
      .then(() => {
        this.graphRendered = true;
        console.log("Gráfico Plotly (Apenas Linhas) renderizado.");
      })
      .catch(err => {
        console.error("Erro ao renderizar Plotly (Apenas Linhas):", err);
      });
  }

  private clearGraph(): void {
    if (this.graphRendered && this.plotlyGraph && this.plotlyGraph.nativeElement) {
      Plotly.purge(this.plotlyGraph.nativeElement);
      this.graphRendered = false;
      console.log("Gráfico limpo.");
    }
    if (this.plotlyGraph && this.plotlyGraph.nativeElement) {
      this.plotlyGraph.nativeElement.innerHTML = '';
    }
  }

  private handleNonOptimalResponse(response: BaseSolverResponse): void {
    let message = `Status: ${response.status}.`;
    if (response.error) {
      message = response.error;
    } else {
      message = this.getNonOptimalMessage(response.status);
    }
    this.snackBar.open(message, 'Fechar', { duration: 5000 });
  }

  public getNonOptimalMessage(status: string | undefined | null): string {
    if (!status) return '';
    switch (status) {
      case 'Infeasible':
        return 'O problema não possui solução que satisfaça todas as restrições.';
      case 'Unbounded':
        return 'A função objetivo pode crescer (ou diminuir) indefinidamente dentro da região factível.';
      case 'Error':
        return 'Ocorreu um erro durante a resolução no servidor.';
      case 'Erro na comunicação':
        return 'Falha ao conectar com o servidor de resolução.';
      default:
        return `Status inesperado recebido: ${status}.`;
    }
  }

  markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  resetForm(): void {
    this.initForm();
    this.mathematicalSolution = null;
    this.clearGraph();
    this.isLoading = false;
    this.snackBar.open('Formulário resetado!', 'OK', { duration: 2000 });
  }
}