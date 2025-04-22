import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-graphical-solver',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './graphical-solver.component.html'
    // styleUrls: ['./graphical-solver.component.css']
  })

export class GraphicalSolverComponent implements OnChanges {
    @Input() problemData: any;
    
    constructor() {}
    
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['problemData'] && this.problemData) {
        this.renderGraphicalSolution();
      }
    }
    
    renderGraphicalSolution(): void {
      console.log('Renderizando solução gráfica para:', this.problemData);
      // Implementar a lógica para renderizar o gráfico
      // Você pode usar bibliotecas como Chart.js, D3.js ou outras
    }
  }