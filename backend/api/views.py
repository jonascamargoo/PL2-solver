import pulp as plp
import numpy as np
import math
from itertools import combinations

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# --- Funções Auxiliares para Geometria ---

# Tolerância para comparações de ponto flutuante
TOLERANCE = 1e-7

def solve_linear_system(line1, line2):
    """Resolve o sistema de duas equações lineares para encontrar a interseção."""
    a1, b1, c1 = line1
    a2, b2, c2 = line2
    A = np.array([[a1, b1], [a2, b2]])
    B = np.array([c1, c2])
    try:
        # Resolve Ax = B
        intersection = np.linalg.solve(A, B)
        return tuple(intersection)
    except np.linalg.LinAlgError:
        # Linhas paralelas ou coincidentes, sem interseção única finita
        return None

def is_feasible(point, constraints):
    """Verifica se um ponto satisfaz todas as restrições."""
    x, y = point
    # Verificar não-negatividade primeiro (com tolerância)
    if x < -TOLERANCE or y < -TOLERANCE: return False
    
    for constraint in constraints:
        coeffs = constraint['coefficients']
        op = constraint['operator']
        val = constraint['valor']
        expression_val = coeffs[0] * x + coeffs[1] * y

        if op == '<=':
            if expression_val > val + TOLERANCE: return False
        elif op == '>=':
            if expression_val < val - TOLERANCE: return False 
            
    return True

def order_vertices(vertices: list)  -> list:
    """Ordena os vértices de um polígono convexo em sentido anti-horário."""
    
    # Não há polígono para ordenar
    if not vertices or len(vertices) < 3: return vertices
         
    # Calcular o centroide
    center_x = sum(point[0] for point in vertices) / len(vertices)
    center_y = sum(point[1] for point in vertices) / len(vertices)

    # Calcular o ângulo de cada vértice em relação ao centroide
    # Usar math.atan2(y - cy, x - cx)
    vertices_with_angles = []
    for x, y in vertices:
        angle = math.atan2(y - center_y, x - center_x)
        vertices_with_angles.append(((x, y), angle))

    # Ordenar os vértices pelo ângulo
    vertices_with_angles.sort(key=lambda item: item[1])

    # Retornar apenas os vértices ordenados
    ordered_vertices = [item[0] for item in vertices_with_angles]
    return ordered_vertices

def get_feasible_region_vertices(constraints: list) -> list:
    """Calcula os vértices ordenados da região factível."""
    lines = []
    # 1. Adicionar linhas das restrições explícitas
    for const in constraints:
        lines.append(tuple(const['coefficients'] + [const['valor']]))

    # 2. Adicionar linhas dos eixos (não-negatividade implícita x1>=0, x2>=0)
    lines.append((1, 0, 0)) # x1 = 0
    lines.append((0, 1, 0)) # x2 = 0

    # 3. Encontrar todas as interseções únicas
    intersections = set()
    for line1, line2 in combinations(lines, 2):
        intersection_point = solve_linear_system(line1, line2)
        if intersection_point:
            # Arredondar para lidar com pequenas imprecisões e evitar duplicatas
            rounded_point = (round(intersection_point[0], 7), round(intersection_point[1], 7))
            intersections.add(rounded_point)

    # 4. Filtrar interseções para encontrar vértices factíveis
    feasible_vertices = set() # Usar set para garantir unicidade após verificação
    for point in intersections:
        if is_feasible(point, constraints):
            # Adicionar ponto factível (arredondado para consistência)
            feasible_vertices.add(point)

    # 5. Ordenar os vértices factíveis
    # Converter set para lista antes de ordenar
    ordered_feasible_vertices = order_vertices(list(feasible_vertices))

    # Converter para lista de listas para JSON
    return [list(point) for point in ordered_feasible_vertices]


# --- API Views ---

class SolverBaseView(APIView):
    """View base para extrair dados da requisição."""

    def get_problem_data(self, request):
        data = request.data
        objective = data.get('objective')
        objective_func = data.get('objective_func')
        constraints = data.get('constraints')

        # Validação básica (pode ser melhorada com Serializers)
        if not all([objective, objective_func, constraints]):
            raise ValueError("Dados incompletos na requisição.")
        if objective not in ['max', 'min']:
            raise ValueError("Objetivo deve ser 'max' ou 'min'.")
        if not isinstance(objective_func, list) or len(objective_func) != 2:
             raise ValueError("Função objetivo deve ser uma lista com 2 coeficientes.")
        if not isinstance(constraints, list):
             raise ValueError("Restrições devem ser uma lista.")

        return objective, objective_func, constraints

    def solve_lp_problem(self, objective, objective_func, constraints):
        """Resolve o problema LP usando PuLP."""
        prob = plp.LpProblem("LP_Problem", plp.LpMaximize if objective == 'max' else plp.LpMinimize)

        # Variáveis (assumindo x1, x2 por enquanto)
        x1 = plp.LpVariable("x1", lowBound=0)
        x2 = plp.LpVariable("x2", lowBound=0)
        variables = {'x1': x1, 'x2': x2} # Mapeia nome para variável PuLP

        # Função Objetivo
        prob += objective_func[0] * x1 + objective_func[1] * x2, "Objective Function"

        # Restrições
        for i, const in enumerate(constraints):
            expr = const['coefficients'][0] * x1 + const['coefficients'][1] * x2
            op = const['operator']
            val = const['valor']
            if op == '<=':
                prob += expr <= val, f"Constraint_{i}"
            elif op == '>=':
                prob += expr >= val, f"Constraint_{i}"
                
        prob.solve()

        result = {
            "status": plp.LpStatus[prob.status]
        }
        if result["status"] == 'Optimal':
            result["optimal_value"] = plp.value(prob.objective)
            result["variables"] = {v.name: v.varValue for v in prob.variables()}
        elif result["status"] in ['Infeasible', 'Unbounded']:
             result["variables"] = {}
             result["optimal_value"] = None

        return result


class SolveView(SolverBaseView):
    """View para resolver e retornar apenas a solução numérica."""
    def post(self, request, *args, **kwargs):
        try:
            objective, objective_func, constraints = self.get_problem_data(request)
            solution = self.solve_lp_problem(objective, objective_func, constraints)
            return Response(solution, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"status": "Error", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Erro inesperado no backend (SolveView): {e}")
            return Response(
                {"status": "Error", "error": "Erro interno no servidor ao resolver."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SolvePlotView(SolverBaseView):
    """View para resolver E calcular dados para plotagem."""
    def post(self, request, *args, **kwargs):
        try:
            objective, objective_func, constraints = self.get_problem_data(request)

            # 1. Resolver o problema LP
            solution = self.solve_lp_problem(objective, objective_func, constraints)

            # 2. Calcular vértices se for viável (ótimo, infactível ou unbounded pode ter região)
            vertices = []
            if solution['status'] != 'Error': # Tenta calcular vértices mesmo se não for ótimo
                 try:
                    vertices = get_feasible_region_vertices(constraints)
                    # Se a região for unbounded, a lógica atual pode retornar poucos
                    # ou nenhum vértice, ou vértices que não fecham um polígono visualmente.
                    # A detecção de unboundedness real dependeria de análise mais profunda.
                    if solution['status'] == 'Unbounded' and not vertices:
                         print("Aviso: Problema unbounded e nenhum vértice encontrado pela lógica atual.")
                         # Poderia tentar adicionar pontos ao infinito simbolicamente? Complexo.
                    if solution['status'] == 'Infeasible' and vertices:
                         print("Aviso: Problema Infeasible mas vértices encontrados? Verifique a lógica.")
                         vertices = [] # Se é infactível, não deveria haver vértices factíveis.


                 except Exception as e:
                    print(f"Erro ao calcular vértices: {e}")
                    solution['error'] = (solution.get('error', '') + " Erro ao calcular vértices.").strip()
                    # Não quebra a resposta, mas os vértices estarão vazios

            # 3. Combinar resultados
            response_data = {**solution, "feasible_region_vertices": vertices}
            # Opcional: Adicionar constraint_lines aqui se implementado

            return Response(response_data, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({"status": "Error", "error": str(e), "feasible_region_vertices": []},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log do erro real é importante aqui
            print(f"Erro inesperado no backend (SolvePlotView): {e}")
            # Inclui a stack trace no log se possível: import traceback; traceback.print_exc()
            return Response({"status": "Error", "error": "Erro interno no servidor ao processar para plotagem.", "feasible_region_vertices": []},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)