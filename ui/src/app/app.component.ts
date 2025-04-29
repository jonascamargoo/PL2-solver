// import { Component, OnInit } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { SolverComponent } from './components/solver/solver.component';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import Plotly from 'plotly.js-dist-min';
// import { Data, Layout, Config } from 'plotly.js-dist-min';

// interface Graph {
//   data: Partial<Data>[];
//   layout: Partial<Layout>;
//   config?: Partial<Config>;
// }

// interface LinearProgrammingProblem {
//   objective: string;
//   objectiveCoefficients: number[];
//   constraints: {
//     coefficients: number[];
//     operator: string;
//     value: number;
//   }[];
// }

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterOutlet,
//     SolverComponent,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatIconModule,
//     MatSnackBarModule
//   ],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css'],
// })


// export class AppComponent implements OnInit {
//   linearProgrammingForm!: FormGroup;
//   objectiveOptions: string[] = ['Maximizar', 'Minimizar'];
//   operatorOptions: string[] = ['≤', '≥'];

//   constructor(
//     private fb: FormBuilder,
//     private snackBar: MatSnackBar
//   ) { }

//   ngOnInit(): void {
//     this.initForm();
//   }

//   initForm(): void {
//     this.linearProgrammingForm = this.fb.group({
//       objective: ['Maximizar', Validators.required],
//       objectiveCoefficients: this.fb.array([
//         this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]),
//         this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)])
//       ]),
//       constraints: this.fb.array([
//         this.createConstraint(),
//         this.createConstraint()
//       ])
//     });
//   }

//   createConstraint(): FormGroup {
//     return this.fb.group({
//       coefficients: this.fb.array([
//         this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]),
//         this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)])
//       ]),
//       operator: ['≤', Validators.required],
//       value: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]]
//     });
//   }

//   get objectiveCoefficients(): FormArray<FormControl> {
//     return this.linearProgrammingForm.get('objectiveCoefficients') as FormArray<FormControl>;
//   }

//   get constraints(): FormArray<FormGroup> {
//     return this.linearProgrammingForm.get('constraints') as FormArray<FormGroup>;
//   }

//   addConstraint(): void {
//     if (this.constraints.length < 10) {
//       this.constraints.push(this.createConstraint());
//     } else {
//       this.snackBar.open('Máximo de 10 restrições atingido', 'Fechar', { duration: 3000 });
//     }
//   }

//   removeConstraint(): void {
//     if (this.constraints.length > 2) {
//       this.constraints.removeAt(this.constraints.length - 1);
//     } else {
//       this.snackBar.open('Deve haver pelo menos duas restrições', 'Fechar', { duration: 3000 });
//     }
//   }

//   getConstraintCoefficients(index: number): FormArray<FormControl> {
//     return this.constraints.at(index).get('coefficients') as FormArray<FormControl>;
//   }

//   solveProblem(): void {
//     if (this.linearProgrammingForm.valid) {
//       const formData = this.linearProgrammingForm.value;

//       const problem: LinearProgrammingProblem = {
//         objective: formData.objective,
//         objectiveCoefficients: formData.objectiveCoefficients.map(Number),
//         constraints: formData.constraints.map((constraint: any) => ({
//           coefficients: constraint.coefficients.map(Number),
//           operator: constraint.operator,
//           value: Number(constraint.value)
//         })),

//       };

//       console.log('Problema para resolver:', problem);
//       this.snackBar.open('Formulário válido! Problema encaminhado para resolução', 'OK', { duration: 3000 });

//       // Aqui eu irei chamar o serviço que implementa o algoritmo de resolução

//     } else {
//       this.markFormGroupTouched(this.linearProgrammingForm);
//       this.snackBar.open('Por favor, preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
//     }
//   }

//   solveGraphically() {
//     if (this.linearProgrammingForm.valid) {
//       const formData = this.linearProgrammingForm.value;

//       const problem: LinearProgrammingProblem = {
//         objective: formData.objective,
//         objectiveCoefficients: formData.objectiveCoefficients.map(Number),
//         constraints: formData.constraints.map((constraint: any) => ({
//           coefficients: constraint.coefficients.map(Number),
//           operator: constraint.operator,
//           value: Number(constraint.value)
//         })),

//       };

//       console.log('Problema para resolver:', problem);
//       this.snackBar.open('Formulário válido! Problema encaminhado para resolução', 'OK', { duration: 3000 });

//       // ...

//     } else {
//       this.markFormGroupTouched(this.linearProgrammingForm);
//       this.snackBar.open('Por favor, preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
//     }
//   }

//   solveMathematically() {
//     if (this.linearProgrammingForm.valid) {
//       const formData = this.linearProgrammingForm.value;

//       const problem: LinearProgrammingProblem = {
//         objective: formData.objective,
//         objectiveCoefficients: formData.objectiveCoefficients.map(Number),
//         constraints: formData.constraints.map((constraint: any) => ({
//           coefficients: constraint.coefficients.map(Number),
//           operator: constraint.operator,
//           value: Number(constraint.value)
//         })),

//       };

//       console.log('Problema para resolver:', problem);
//       this.snackBar.open('Formulário válido! Problema encaminhado para resolução', 'OK', { duration: 3000 });

//       // ...

//     } else {
//       this.markFormGroupTouched(this.linearProgrammingForm);
//       this.snackBar.open('Por favor, preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
//     }
//   }

//   // private plotGraph() {
//   //   if (this.graphData) {
//   //     const { feasible_region, optimal_point } = this.graphData;
//   //     // Chama o método de renderização do SolverComponent, por exemplo usando um EventEmitter ou diretamente
//   //     const layout = {
//   //       title: 'Solução Gráfica',
//   //       xaxis: { title: 'x1' },
//   //       yaxis: { title: 'x2' }
//   //     };
//   //     const data = [
//   //       {
//   //         x: feasible_region.x,
//   //         y: feasible_region.y,
//   //         fill: 'toself',
//   //         type: 'scatter',
//   //         mode: 'lines',
//   //         name: 'Região Factível'
//   //       },
//   //       {
//   //         x: [optimal_point[0]],
//   //         y: [optimal_point[1]],
//   //         type: 'scatter',
//   //         mode: 'markers',
//   //         marker: { color: 'red', size: 10 },
//   //         name: 'Ponto Ótimo'
//   //       }
//   //     ];
//   //     Plotly.newPlot('graphDiv', data as any, layout);
//   //   }
//   // }



//   // Função auxiliar para marcar todos os campos do formulário como touched. Útil para mostrar erros de validação quando o usuário tenta enviar um formulário inválido
//   markFormGroupTouched(formGroup: FormGroup) {
//     Object.values(formGroup.controls).forEach(control => {
//       control.markAsTouched();
//       if (control instanceof FormGroup) {
//         this.markFormGroupTouched(control);
//       }
//       if (control instanceof FormArray) {
//         control.controls.forEach(c => {
//           if (c instanceof FormGroup) {
//             this.markFormGroupTouched(c);
//           } else {
//             c.markAsTouched();
//           }
//         });
//       }
//     });
//   }

//   resetForm(): void {
//     this.linearProgrammingForm = this.fb.group({
//       objective: ['Maximizar', Validators.required],
//       objectiveCoefficients: this.fb.array([
//         this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]),
//         this.fb.control('', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)])
//       ]),
//       constraints: this.fb.array([
//         this.createConstraint(),
//         this.createConstraint()
//       ])
//     });
//     this.snackBar.open('Formulário resetado com sucesso!', 'OK', { duration: 2000 });
//   }
// }


import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Importe o Spinner
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SolverRequest, SolverService, SolverResponse  } from './services/solver.service';
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
    MatProgressSpinnerModule // Adicione o módulo do Spinner
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('plotlyGraph') plotlyGraph!: ElementRef; // Referência para a div do gráfico

  linearProgrammingForm!: FormGroup;
  objectiveOptions: string[] = ['Maximizar', 'Minimizar'];
  operatorOptions: string[] = ['≤', '≥'];
  

  isLoading = false; // Estado de carregamento
  mathematicalSolution: SolverResponse | null = null; // Armazena a solução matemática
  graphRendered = false; // Indica se um gráfico foi renderizado

  private destroy$ = new Subject<void>(); // Para cancelar subscriptions
  public objectKeys = Object.keys;

  constructor(
    private fb: FormBuilder,
    private solverService: SolverService, // Injete o serviço
    private snackBar: MatSnackBar
  ) {}

    // Adicione este método público para mensagens de status não ótimos
    public getNonOptimalMessage(status: string | undefined | null): string {
      if (!status) return ''; // Retorna vazio se o status for nulo/undefined
  
      switch (status) {
        case 'Infeasible':
          return 'O problema não possui solução que satisfaça todas as restrições.';
        case 'Unbounded':
          return 'A função objetivo pode crescer (ou diminuir) indefinidamente dentro da região factível.';
        case 'Error':
          return 'Ocorreu um erro durante a resolução no servidor. Verifique os logs do backend.';
        case 'Erro na comunicação':
          return 'Falha ao conectar com o servidor de resolução. Verifique se o backend está rodando e acessível.';
        // Adicione outros casos se o seu backend puder retornar mais status
        default:
          return `O solver retornou um status inesperado: ${status}.`;
      }
    }

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
    if (this.constraints.length > 1) { // Permitir remover até ficar com 1 restrição
      this.constraints.removeAt(this.constraints.length - 1);
    } else {
      this.snackBar.open('Deve haver pelo menos uma restrição', 'Fechar', { duration: 3000 });
    }
  }

  // Função auxiliar para preparar os dados para o backend
  private prepareRequestData(): SolverRequest | null {
    if (!this.linearProgrammingForm.valid) {
      this.markFormGroupTouched(this.linearProgrammingForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', { duration: 3000 });
      return null;
    }

    const formData = this.linearProgrammingForm.getRawValue(); // getRawValue inclui campos desabilitados se houver

    const requestData: SolverRequest = {
      objective: formData.objective === 'Maximizar' ? 'max' : 'min',
      objective_func: formData.objectiveCoefficients.map(Number),
      constraints: formData.constraints.map((constraint: any) => ({
        coefficients: constraint.coefficients.map(Number),
        operator: constraint.operator === '≤' ? '<=' : '>=',
        valor: Number(constraint.value) // Backend espera 'valor'
      })),
    };

    // Validação adicional (opcional): verificar se há pelo menos uma restrição
    if (!requestData.constraints || requestData.constraints.length === 0) {
        this.snackBar.open('Adicione pelo menos uma restrição.', 'Fechar', { duration: 3000 });
        return null;
    }

    return requestData;
  }

  solveGraphically(): void {
    const requestData = this.prepareRequestData();
    if (!requestData) return; // Sai se os dados não forem válidos

    this.isLoading = true;
    this.mathematicalSolution = null; // Limpa solução matemática anterior
    this.clearGraph(); // Limpa gráfico anterior

    this.solverService.solve(requestData)
      .pipe(
        takeUntil(this.destroy$), // Cancela se o componente for destruído
        finalize(() => this.isLoading = false) // Garante que o loading termine
      )
      .subscribe({
        next: (response) => {
          console.log('Resposta do Backend (Gráfico):', response);
          if (response.status === 'Optimal' && response.variables) {
            // **Importante:** O backend atual SÓ retorna o ponto ótimo.
            // Plotar a região factível requereria ou que o backend retornasse
            // os pontos da região, ou que calculássemos isso no frontend
            // (complexo). Vamos plotar apenas o ponto ótimo por enquanto.
            this.plotOptimalPoint(response);
            this.snackBar.open(`Solução ótima encontrada! Gráfico plotado. Valor: ${response.optimal_value}`, 'OK', { duration: 4000 });
          } else {
            // Lida com outros status (Infeasible, Unbounded, Error)
            this.handleNonOptimalResponse(response);
          }
        },
        error: (err) => {
          console.error('Erro ao chamar o serviço (Gráfico):', err);
          this.snackBar.open(`Erro: ${err.message}`, 'Fechar', { duration: 5000 });
          this.clearGraph(); // Garante que não haja gráfico antigo em caso de erro
        }
      });
  }

  solveMathematically(): void {
    const requestData = this.prepareRequestData();
    if (!requestData) return; // Sai se os dados não forem válidos

    this.isLoading = true;
    this.mathematicalSolution = null; // Limpa solução anterior
    this.clearGraph(); // Limpa o gráfico se houver

    this.solverService.solve(requestData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Resposta do Backend (Matemático):', response);
          this.mathematicalSolution = response; // Armazena a resposta para exibição
          if (response.status === 'Optimal') {
            this.snackBar.open(`Solução ótima encontrada! Valor: ${response.optimal_value}`, 'OK', { duration: 4000 });
          } else {
             // Lida com outros status (Infeasible, Unbounded, Error) e exibe no painel
            this.handleNonOptimalResponse(response);
          }
        },
        error: (err) => {
          console.error('Erro ao chamar o serviço (Matemático):', err);
          // Exibe o erro também na área de solução matemática, se desejado
          this.mathematicalSolution = {
              status: 'Erro na comunicação',
              variables: {},
              optimal_value: NaN, // ou 0, ou null
              error: err.message
          };
          this.snackBar.open(`Erro: ${err.message}`, 'Fechar', { duration: 5000 });
        }
      });
  }

  // Função para plotar apenas o ponto ótimo (limitação do backend atual)
  private plotOptimalPoint(solution: SolverResponse): void {
    // Assume que as variáveis são x1 e x2 para um gráfico 2D
    const x1 = solution.variables['x1'] ?? 0; // Usa 0 se x1 não existir
    const x2 = solution.variables['x2'] ?? 0; // Usa 0 se x2 não existir

    if (!this.plotlyGraph || !this.plotlyGraph.nativeElement) {
        console.error("Elemento do gráfico não encontrado no DOM.");
        this.snackBar.open("Erro ao renderizar o gráfico: elemento não encontrado.", "Fechar", {duration: 3000});
        return;
    }

    const trace: Partial<Data> = {
      x: [x1],
      y: [x2],
      mode: 'markers',
      type: 'scatter',
      name: 'Ponto Ótimo',
      marker: { color: 'red', size: 12 }
    };

    // Adiciona eixos X e Y para dar contexto
    const traceXAxis: Partial<Data> = {
        x: [0, Math.max(5, x1 * 1.2)], // Linha do eixo X até um pouco além do ponto ótimo ou 5
        y: [0, 0],
        mode: 'lines',
        type: 'scatter',
        name: 'Eixo X (x1)',
        line: { color: 'grey', dash: 'dot'}
    };
     const traceYAxis: Partial<Data> = {
        x: [0, 0],
        y: [0, Math.max(5, x2*1.2)], // Linha do eixo Y até um pouco além do ponto ótimo ou 5
        mode: 'lines',
        type: 'scatter',
        name: 'Eixo Y (x2)',
        line: { color: 'grey', dash: 'dot'}
    };

    const layout: Partial<Layout> = {
      title: `Ponto Ótimo da Solução (${solution.status})`,
      xaxis: { title: 'X₁', range: [ -1, Math.max(5, x1 * 1.2) ] }, // Ajusta o range do eixo x, mínimo -1
      yaxis: { title: 'X₂', range: [ -1, Math.max(5, x2 * 1.2) ] }, // Ajusta o range do eixo y, mínimo -1
      showlegend: true,
      // Adiciona a origem (0,0) para melhor visualização
      shapes: [{
          type: 'circle',
          xref: 'x', yref: 'y',
          x0: -0.1, y0: -0.1, x1: 0.1, y1: 0.1, // Pequeno círculo na origem
          fillcolor: 'black',
          line: { color: 'black' }
      }]
    };

    Plotly.newPlot(this.plotlyGraph.nativeElement, [trace, traceXAxis, traceYAxis], layout, { responsive: true })
        .then(() => {
             this.graphRendered = true;
             console.log("Gráfico Plotly renderizado.");
        })
        .catch(err => {
             console.error("Erro ao renderizar Plotly:", err);
             this.snackBar.open("Erro interno ao gerar o gráfico.", "Fechar", { duration: 3000});
        });
  }

  // Limpa o gráfico Plotly da div
  private clearGraph(): void {
    if (this.graphRendered && this.plotlyGraph && this.plotlyGraph.nativeElement) {
      Plotly.purge(this.plotlyGraph.nativeElement);
      this.graphRendered = false;
      console.log("Gráfico limpo.");
    }
     // Garante que a div esteja vazia mesmo que Plotly.purge falhe ou não seja chamado
    if (this.plotlyGraph && this.plotlyGraph.nativeElement) {
        this.plotlyGraph.nativeElement.innerHTML = '';
    }
  }

  // Lida com respostas não ótimas (Infeasible, Unbounded, Error)
  private handleNonOptimalResponse(response: SolverResponse): void {
      let message = `Status: ${response.status}.`;
      if (response.error) {
          message += ` Detalhes: ${response.error}`;
      } else if (response.status === 'Infeasible') {
          message = 'O problema não possui solução factível.';
      } else if (response.status === 'Unbounded') {
          message = 'O problema possui solução ilimitada.';
      } else {
          message = `O problema retornou com status: ${response.status}.`;
      }
      this.snackBar.open(message, 'Fechar', { duration: 5000 });
      // Se for uma resposta matemática, ela será exibida no painel.
      // Se for gráfica, apenas o snackbar aparecerá (pois não há ponto ótimo).
      if(this.mathematicalSolution == null && response != null) { // Se solveMathematically não setou ainda
           this.mathematicalSolution = response; // Mostra o status no painel matemático
      }
  }


  // Função auxiliar para marcar todos os campos do formulário como touched
  markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity(); // Garante que o status de erro seja atualizado

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  resetForm(): void {
    this.initForm(); // Reinicia o formulário para o estado inicial
    this.mathematicalSolution = null; // Limpa a solução matemática
    this.clearGraph(); // Limpa o gráfico
    this.isLoading = false; // Garante que o loading pare
    this.snackBar.open('Formulário resetado!', 'OK', { duration: 2000 });
  }
}