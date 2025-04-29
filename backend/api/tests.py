from django.test import TestCase
import unittest
import numpy as np # Necessário para testes de geometria

# python manage.py test api

from .serializers import SolverRequestSerializer, ConstraintSerializer
from .services import lp_solver_service, geometry_service

# Define dados de exemplo para os testes
VALID_SOLVER_REQUEST_DATA = {
    "objective": "max",
    "objective_func": [3000, 5000],
    "constraints": [
        {"coefficients": [1, 0], "operator": "<=", "valor": 4},    # x1 <= 4
        {"coefficients": [0, 2], "operator": ">=", "valor": 12},   # 2x2 >= 12 -> x2 >= 6
        {"coefficients": [3, 2], "operator": "<=", "valor": 18}    # 3x1 + 2x2 <= 18
    ]
}

INFEASIBLE_CONSTRAINTS = [
    {"coefficients": [1, 0], "operator": "<=", "valor": 1}, # x1 <= 1
    {"coefficients": [1, 0], "operator": ">=", "valor": 2}  # x1 >= 2
]

UNBOUNDED_PROBLEM_DATA = {
    "objective": "max",
    "objective_func": [1, 0], # Maximize x1
    "constraints": [
        {"coefficients": [0, 1], "operator": "<=", "valor": 5} # x2 <= 5 (x1 pode crescer indefinidamente)
    ]
}

# --- Testes para Serializers ---

class SerializerTests(unittest.TestCase):

    def test_valid_constraint_serializer(self):
        data = {"coefficients": [1, 2], "operator": "<=", "valor": 10}
        serializer = ConstraintSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_invalid_constraint_serializer_operator(self):
        data = {"coefficients": [1, 2], "operator": "=", "valor": 10} # Operador inválido
        serializer = ConstraintSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('operator', serializer.errors)

    def test_invalid_constraint_serializer_coeffs_length(self):
        data = {"coefficients": [1], "operator": "<=", "valor": 10} # Coeficientes a menos
        serializer = ConstraintSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('coefficients', serializer.errors)

    def test_invalid_constraint_serializer_coeffs_type(self):
        data = {"coefficients": [1, "a"], "operator": "<=", "valor": 10} # Tipo inválido nos coeficientes
        serializer = ConstraintSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('coefficients', serializer.errors)

    def test_invalid_solver_request_missing_field(self):
        data = VALID_SOLVER_REQUEST_DATA.copy()
        del data['objective'] # Remove campo obrigatório
        serializer = SolverRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('objective', serializer.errors)

    def test_invalid_solver_request_bad_constraint(self):
        data = VALID_SOLVER_REQUEST_DATA.copy()
        data['constraints'][0]['operator'] = '!=' # Constraint inválida
        serializer = SolverRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('constraints', serializer.errors)


# --- Testes para LP Solver Service ---

class LpSolverServiceTests(unittest.TestCase):

    def test_solve_optimal_problem(self):
        """Testa a resolução de um problema com solução ótima conhecida."""
        result = lp_solver_service.solve_problem(
            VALID_SOLVER_REQUEST_DATA['objective'],
            VALID_SOLVER_REQUEST_DATA['objective_func'],
            VALID_SOLVER_REQUEST_DATA['constraints']
        )
        self.assertEqual(result['status'], 'Optimal')
        self.assertAlmostEqual(result['optimal_value'], 45000.0)
        self.assertIn('variables', result)
        self.assertAlmostEqual(result['variables'].get('x1'), 0.0)
        self.assertAlmostEqual(result['variables'].get('x2'), 9.0)

    def test_solve_infeasible_problem(self):
        """Testa a resolução de um problema infactível."""
        result = lp_solver_service.solve_problem(
            'max', # Objetivo não importa muito aqui
            [1, 1],
            INFEASIBLE_CONSTRAINTS # Usa as restrições infactíveis definidas
        )
        self.assertEqual(result['status'], 'Infeasible')
        self.assertIsNone(result.get('optimal_value'))
        self.assertEqual(result.get('variables'), {})

    def test_solve_unbounded_problem(self):
        """Testa a resolução de um problema ilimitado."""
        result = lp_solver_service.solve_problem(
            UNBOUNDED_PROBLEM_DATA['objective'],
            UNBOUNDED_PROBLEM_DATA['objective_func'],
            UNBOUNDED_PROBLEM_DATA['constraints']
        )
        self.assertEqual(result['status'], 'Unbounded')
        self.assertIsNone(result.get('optimal_value'))
        self.assertEqual(result.get('variables'), {})


# --- Testes para Geometry Service ---

class GeometryServiceTests(unittest.TestCase):

    def setUp(self):
        """Define restrições de exemplo para testes de geometria."""
        # x1 <= 4, x2 >= 6, 3x1 + 2x2 <= 18
        self.constraints = VALID_SOLVER_REQUEST_DATA['constraints']
        # Vértices esperados (a ordem pode variar antes de order_vertices)
        self.expected_vertices_set = {(0.0, 9.0), (0.0, 6.0), (2.0, 6.0)}
        # Ordem anti-horária esperada (começando do mais alto no eixo y)
        self.expected_ordered_vertices = [[0.0, 9.0], [0.0, 6.0], [2.0, 6.0]]


    def test_solve_linear_system_intersection(self):
        """Testa encontrar interseção conhecida."""
        # 3x + 2y = 18  => (3, 2, 18)
        # x = 0         => (1, 0, 0)
        point = geometry_service.solve_linear_system((3, 2, 18), (1, 0, 0))
        self.assertIsNotNone(point)
        self.assertAlmostEqual(point[0], 0.0)
        self.assertAlmostEqual(point[1], 9.0)

        # y = 6         => (0, 1, 6)
        # 3x + 2y = 18  => (3, 2, 18)
        point = geometry_service.solve_linear_system((0, 1, 6), (3, 2, 18))
        self.assertIsNotNone(point)
        self.assertAlmostEqual(point[0], 2.0)
        self.assertAlmostEqual(point[1], 6.0)


    def test_solve_linear_system_parallel(self):
        """Testa retas paralelas."""
        # x + y = 1 => (1, 1, 1)
        # x + y = 2 => (1, 1, 2)
        point = geometry_service.solve_linear_system((1, 1, 1), (1, 1, 2))
        self.assertIsNone(point)

    def test_is_feasible_point_inside(self):
        """Testa um ponto conhecido dentro da região factível."""
        point = (1.0, 7.0) # Ex: x1=1, x2=7
        # Checa: 1<=4 (T), 7>=6 (T), 3(1)+2(7)<=18 -> 3+14<=18 -> 17<=18 (T)
        self.assertTrue(geometry_service.is_feasible(point, self.constraints))

    def test_is_feasible_point_outside(self):
        """Testa um ponto conhecido fora da região factível."""
        point = (3.0, 6.0) # Ex: x1=3, x2=6
        # Checa: 3<=4 (T), 6>=6 (T), 3(3)+2(6)<=18 -> 9+12<=18 -> 21<=18 (F)
        self.assertFalse(geometry_service.is_feasible(point, self.constraints))

        point_violating_x = (5.0, 7.0) # Viola x1 <= 4
        self.assertFalse(geometry_service.is_feasible(point_violating_x, self.constraints))

        point_violating_y = (1.0, 5.0) # Viola x2 >= 6
        self.assertFalse(geometry_service.is_feasible(point_violating_y, self.constraints))

    def test_is_feasible_point_on_boundary(self):
        """Testa um ponto na fronteira (deve ser factível)."""
        point = (2.0, 6.0) # Vértice C
        self.assertTrue(geometry_service.is_feasible(point, self.constraints))
        point = (0.0, 9.0) # Outro vértice
        self.assertTrue(geometry_service.is_feasible(point, self.constraints))

    def test_calculate_feasible_vertices_infeasible(self):
        """Testa o cálculo de vértices para um problema infactível."""
        calculated_vertices = geometry_service.calculate_feasible_vertices(INFEASIBLE_CONSTRAINTS)
        self.assertEqual(calculated_vertices, []) # Espera lista vazia
