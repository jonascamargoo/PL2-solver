import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicalSolverComponent } from './graphical-solver.component';

describe('GraphicalSolverComponent', () => {
  let component: GraphicalSolverComponent;
  let fixture: ComponentFixture<GraphicalSolverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphicalSolverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphicalSolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
