// app.routes.ts
import { Routes } from '@angular/router';
import { GraphicalSolverComponent } from './components/components/graphical-solver/graphical-solver.component';

export const routes: Routes = [
  { path: '', component: GraphicalSolverComponent },
  { path: '**', redirectTo: '' }
];