import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SolverComponent } from './components/solver/solver.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface LinearProgrammingProblem {
  objective: string;
  objectiveCoefficients: number[];
  constraints: {
    coefficients: number[];
    operator: string;
    value: number;
  }[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SolverComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  linearProgrammingForm!: FormGroup;
  objectiveOptions: string[] = ['Maximizar', 'Minimizar'];
  operatorOptions: string[] = ['≤', '≥'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
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
      value: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]]
    });
  }

  get objectiveCoefficients(): FormArray<FormControl> {
    return this.linearProgrammingForm.get('objectiveCoefficients') as FormArray<FormControl>;
  }

  get constraints(): FormArray<FormGroup> {
    return this.linearProgrammingForm.get('constraints') as FormArray<FormGroup>;
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

  getConstraintCoefficients(index: number): FormArray<FormControl> {
    return this.constraints.at(index).get('coefficients') as FormArray<FormControl>;
  }

  solveProblem(): void {
    if (this.linearProgrammingForm.valid) {
      const formData = this.linearProgrammingForm.value;

      const problem: LinearProgrammingProblem = {
        objective: formData.objective,
        objectiveCoefficients: formData.objectiveCoefficients.map(Number),
        constraints: formData.constraints.map((constraint: any) => ({
          coefficients: constraint.coefficients.map(Number),
          operator: constraint.operator,
          value: Number(constraint.value)
        })),

      };

      console.log('Problema para resolver:', problem);
      this.snackBar.open('Formulário válido! Problema encaminhado para resolução', 'OK', { duration: 3000 });

      // Aqui eu irei chamar o serviço que implementa o algoritmo de resolução

    } else {
      this.markFormGroupTouched(this.linearProgrammingForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
    }
  }

  solveGraphically() {
    if (this.linearProgrammingForm.valid) {
      const formData = this.linearProgrammingForm.value;

      const problem: LinearProgrammingProblem = {
        objective: formData.objective,
        objectiveCoefficients: formData.objectiveCoefficients.map(Number),
        constraints: formData.constraints.map((constraint: any) => ({
          coefficients: constraint.coefficients.map(Number),
          operator: constraint.operator,
          value: Number(constraint.value)
        })),

      };

      console.log('Problema para resolver:', problem);
      this.snackBar.open('Formulário válido! Problema encaminhado para resolução', 'OK', { duration: 3000 });

      // Aqui eu irei chamar o serviço que implementa o algoritmo de resolução

    } else {
      this.markFormGroupTouched(this.linearProgrammingForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
    }
  }

  solveMathematically() {
    if (this.linearProgrammingForm.valid) {
      const formData = this.linearProgrammingForm.value;

      const problem: LinearProgrammingProblem = {
        objective: formData.objective,
        objectiveCoefficients: formData.objectiveCoefficients.map(Number),
        constraints: formData.constraints.map((constraint: any) => ({
          coefficients: constraint.coefficients.map(Number),
          operator: constraint.operator,
          value: Number(constraint.value)
        })),

      };

      console.log('Problema para resolver:', problem);
      this.snackBar.open('Formulário válido! Problema encaminhado para resolução', 'OK', { duration: 3000 });

      // Aqui eu irei chamar o serviço que implementa o algoritmo de resolução

    } else {
      this.markFormGroupTouched(this.linearProgrammingForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
    }
  }

  // private plotGraph() {
  //   if (this.graphData) {
  //     const { feasible_region, optimal_point } = this.graphData;
  //     // Chama o método de renderização do SolverComponent, por exemplo usando um EventEmitter ou diretamente
  //     const layout = {
  //       title: 'Solução Gráfica',
  //       xaxis: { title: 'x1' },
  //       yaxis: { title: 'x2' }
  //     };
  //     const data = [
  //       {
  //         x: feasible_region.x,
  //         y: feasible_region.y,
  //         fill: 'toself',
  //         type: 'scatter',
  //         mode: 'lines',
  //         name: 'Região Factível'
  //       },
  //       {
  //         x: [optimal_point[0]],
  //         y: [optimal_point[1]],
  //         type: 'scatter',
  //         mode: 'markers',
  //         marker: { color: 'red', size: 10 },
  //         name: 'Ponto Ótimo'
  //       }
  //     ];
  //     Plotly.newPlot('graphDiv', data as any, layout);
  //   }
  // }



  // Função auxiliar para marcar todos os campos do formulário como touched. Útil para mostrar erros de validação quando o usuário tenta enviar um formulário inválido
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
      if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  resetForm(): void {
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
    this.snackBar.open('Formulário resetado com sucesso!', 'OK', { duration: 2000 });
  }
}