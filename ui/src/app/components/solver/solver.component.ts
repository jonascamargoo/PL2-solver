// import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
// import Plotly from 'plotly.js-dist-min';
// import { Data, Layout, Config } from 'plotly.js-dist-min';

// interface Graph {
//   data: Partial<Data>[];
//   layout: Partial<Layout>;
//   config?: Partial<Config>;
// }

// @Component({
//   selector: 'app-solver',
//   standalone: true,
//   imports: [],
//   templateUrl: './solver.component.html'
// })
// export class SolverComponent implements AfterViewInit{
//   @ViewChild('plotlyGraph') graphDiv!: ElementRef;

//   public graph: Graph = {
//     data: [
//       { x: [1, 2, 3], y: [2, 6, 3], type: 'scatter', marker: { color: 'red' } },
//       { x: [1, 2, 3], y: [2, 5, 3], type: 'bar' },
//     ],
//     layout: { width: 640, height: 480, title: 'Um Gráfico Fantástico' },
//     config: {}
//   };

//   ngAfterViewInit(): void {
//     this.plot();
//   }

//   plot(): void {
//     Plotly.newPlot(this.graphDiv.nativeElement, this.graph.data as Data[], this.graph.layout, this.graph.config);
//   }

// }

import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { SolverService } from '../../services/solver.service';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms'; // Importe ReactiveFormsModule
import Plotly from 'plotly.js-dist-min';
import { Data, Layout, Config } from 'plotly.js-dist-min';

interface Graph {
  data: Partial<Data>[];
  layout: Partial<Layout>;
  config?: Partial<Config>;
}

@Component({
  selector: 'app-solver',
  standalone: true,
  imports: [ReactiveFormsModule], // Importe ReactiveFormsModule aqui
  templateUrl: './solver.component.html',
  styleUrl: './solver.component.css'
})
export class SolverComponent implements AfterViewInit {
  @ViewChild('plotlyGraph') graphDiv!: ElementRef;
  solverForm: FormGroup;
  solution: { variaveis: { [key: string]: number }; valor_otimo: number; status: string; error?: string } | null = null;
  graph: Graph = {
    data: [],
    layout: { width: 640, height: 480, title: 'Resultado da Solução' },
    config: {}
  };

  constructor(private solverService: SolverService, private fb: FormBuilder) {
    this.solverForm = this.fb.group({
      objective: ['max', Validators.required],
      objective_func: this.fb.array([this.fb.control(0, Validators.required), this.fb.control(0, Validators.required)]), // Inicialize com dois campos
      constraints: this.fb.array([
        this.fb.group({
          coefficients: this.fb.array([this.fb.control(0, Validators.required), this.fb.control(0, Validators.required)]), // Inicialize com dois campos
          operator: ['<=', Validators.required],
          valor: [0, Validators.required]
        })
      ])
    });
  }

  ngAfterViewInit(): void {
    // Inicializar o gráfico vazio
    Plotly.newPlot(this.graphDiv.nativeElement, this.graph.data as Data[], this.graph.layout, this.graph.config);
  }

  get objectiveFuncControls() {
    return (this.solverForm.get('objective_func') as FormArray).controls;
  }

  get constraintControls() {
    return (this.solverForm.get('constraints') as FormArray).controls;
  }

  addObjectiveFuncControl() {
    (this.solverForm.get('objective_func') as FormArray).push(this.fb.control(0, Validators.required));
    this.updateConstraintsCoefficientLength();
  }

  removeObjectiveFuncControl(index: number) {
    (this.solverForm.get('objective_func') as FormArray).removeAt(index);
    this.updateConstraintsCoefficientLength();
  }

  addConstraint() {
    (this.solverForm.get('constraints') as FormArray).push(
      this.fb.group({
        coefficients: this.fb.array(this.objectiveFuncControls.map(() => this.fb.control(0, Validators.required))),
        operator: ['<=', Validators.required],
        valor: [0, Validators.required]
      })
    );
  }

  removeConstraint(index: number) {
    (this.solverForm.get('constraints') as FormArray).removeAt(index);
  }

  updateConstraintsCoefficientLength() {
    const numVariables = this.objectiveFuncControls.length;
    this.constraintControls.forEach(constraintControl => {
      const coefficientsArray = constraintControl.get('coefficients') as FormArray;
      while (coefficientsArray.length > numVariables) {
        coefficientsArray.removeAt(coefficientsArray.length - 1);
      }
      while (coefficientsArray.length < numVariables) {
        coefficientsArray.push(this.fb.control(0, Validators.required));
      }
    });
  }

  onSubmit() {
    if (this.solverForm.valid) {
      this.solverService.solve(this.solverForm.value).subscribe(
        (response) => {
          this.solution = response;
          this.updatePlot(response);
        },
        (error) => {
          this.solution = { variaveis: {}, valor_otimo: 0, status: 'Erro', error: error.message };
          console.error('Erro ao resolver o problema:', error);
        }
      );
    } else {
      console.error('Formulário inválido');
      alert('Por favor, preencha todos os campos corretamente.');
    }
  }

  updatePlot(data: { variaveis: { [key: string]: number }; valor_otimo: number; status: string; error?: string }) {
    if (data.error) {
      this.graph.data = [];
      this.graph.layout.title = 'Erro';
      Plotly.react(this.graphDiv.nativeElement, this.graph.data, this.graph.layout);
      return;
    }

    const xValues = Object.keys(data.variaveis);
    const yValues = Object.values(data.variaveis);

    this.graph.data = [
      {
        x: xValues,
        y: yValues,
        type: 'bar',
        marker: { color: 'blue' }
      }
    ];
    this.graph.layout.title = `Solução Ótima: ${data.valor_otimo}, Status: ${data.status}`;
    Plotly.react(this.graphDiv.nativeElement, this.graph.data as Data[], this.graph.layout);
  }
}