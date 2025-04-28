import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SolverComponent } from './components/solver/solver.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SolverComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ui';
}
