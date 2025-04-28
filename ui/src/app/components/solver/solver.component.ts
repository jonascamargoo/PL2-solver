import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
  imports: [],
  templateUrl: './solver.component.html'
})
export class SolverComponent implements AfterViewInit{
  @ViewChild('plotlyGraph') graphDiv!: ElementRef;

  public graph: Graph = {
    data: [
      { x: [1, 2, 3], y: [2, 6, 3], type: 'scatter', marker: { color: 'red' } },
      { x: [1, 2, 3], y: [2, 5, 3], type: 'bar' },
    ],
    layout: { width: 640, height: 480, title: 'Um Gráfico Fantástico' },
    config: {}
  };

  ngAfterViewInit(): void {
    this.plot();
  }

  plot(): void {
    Plotly.newPlot(this.graphDiv.nativeElement, this.graph.data as Data[], this.graph.layout, this.graph.config);
  }

}