import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Input } from '@angular/core';
import { SolverService } from '../../services/solver.service';
import { PlotlyModule } from 'angular-plotly.js';
import { isPlatformBrowser, CommonModule } from '@angular/common'; // necessário no standalone

@Component({
  selector: 'app-solver',
  standalone: true,
  imports: [CommonModule, PlotlyModule],
  providers: [SolverService],
  templateUrl: './solver.component.html',
  styleUrls: ['./solver.component.css'],
})
export class SolverComponent {
  @Input() problem!: any;

  public graph: any = null;
  private isBrowser: boolean = false;

  constructor(
    private solverService: SolverService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit(): Promise<void> {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const PlotlyJS = await import('plotly.js-dist-min');
      PlotlyModule.plotlyjs = PlotlyJS;
      this.onSolve(); // <- chama ao carregar, mas só depois do Plotly carregar
    }
  }

  onSolve(): void {
    const requestData = {
      constraints: [
        { a: 1, b: 2, c: 6 },
        { a: 3, b: 2, c: 12 }
      ],
      objective: { a: 3, b: 5 }
    };

    this.solverService.solveProblem(requestData).subscribe({
      next: (response) => {
        this.graph = this.buildGraph(response);
      },
      error: (error) => {
        console.error('Erro ao resolver o problema:', error);
      }
    });
  }

  private buildGraph(response: any): any {
    const points = response.points || [];
    const lines = response.lines || [];

    const data = [];

    data.push({
      x: points.map((p: any) => p.x),
      y: points.map((p: any) => p.y),
      mode: 'markers',
      type: 'scatter',
      marker: { color: 'blue', size: 10 },
      name: 'Pontos'
    });

    lines.forEach((line: any, index: number) => {
      data.push({
        x: line.x,
        y: line.y,
        mode: 'lines',
        type: 'scatter',
        line: { dash: 'dashdot', width: 2 },
        name: `Restrição ${index + 1}`
      });
    });

    const layout = {
      autosize: true,
      title: 'Solução Gráfica do Problema',
      xaxis: { title: 'x' },
      yaxis: { title: 'y' }
    };

    return { data, layout };
  }
}
