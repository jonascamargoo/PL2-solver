import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  selector: 'app-linear-programming-solver',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './graphical-solver.component.html',
  styleUrls: ['./graphical-solver.component.css']
})

export class GraphicalSolverComponent implements OnInit {
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
    if (this.constraints.length > 1) {
      this.constraints.removeAt(this.constraints.length - 1);
    } else {
      this.snackBar.open('Deve haver pelo menos uma restrição', 'Fechar', { duration: 3000 });
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
        }))
      };
  
      console.log('Problema para resolver:', problem);
      this.snackBar.open('Formulário válido! Problema encaminhado para resolução', 'OK', { duration: 3000 });
      
      // Aqui eu irei chamar o serviço que implementa o algoritmo de resolução

    } else {
      this.markFormGroupTouched(this.linearProgrammingForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
    }
  }
  
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