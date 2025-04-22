import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simplex-solver',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simplex-solver.component.html'
  // styleUrls: ['./simplex-solver.component.css']
})
export class SimplexSolverComponent implements OnChanges {
  @Input() problemData: any;
  
  constructor() {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['problemData'] && this.problemData) {
      this.solveBySimplex();
    }
  }
  
  solveBySimplex(): void {
    console.log('Resolvendo por Simplex:', this.problemData);
    // Implementar o algoritmo Simplex
  }
}