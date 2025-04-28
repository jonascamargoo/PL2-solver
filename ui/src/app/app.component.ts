import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SolverComponent } from './components/solver/solver.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SolverComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'ui';
}
