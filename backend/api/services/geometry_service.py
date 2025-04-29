import numpy as np
import math
from itertools import combinations

# Tolerância para comparações de ponto flutuante
TOLERANCE = 1e-7

def solve_linear_system(line1, line2):
    """Resolve o sistema de duas equações lineares para encontrar a interseção."""
    a1, b1, c1 = line1
    a2, b2, c2 = line2
    A = np.array([[a1, b1], [a2, b2]])
    B = np.array([c1, c2])
    try:
        # Verifica se a matriz é singular (linhas paralelas/coincidentes)
        if abs(np.linalg.det(A)) < TOLERANCE:
             return None
        intersection = np.linalg.solve(A, B)
        # Verifica se a solução contém NaN ou Inf (pode acontecer em casos degenerados)
        if np.isnan(intersection).any() or np.isinf(intersection).any():
             return None
        return tuple(intersection)
    except np.linalg.LinAlgError:
        # Captura explícita caso 'solve' falhe, embora a verificação do determinante deva pegar antes.
        return None

def is_feasible(point, constraints):
    """Verifica se um ponto satisfaz todas as restrições."""
    x, y = point
    # Verificar não-negatividade primeiro (com tolerância)
    if x < -TOLERANCE or y < -TOLERANCE:
        return False

    for const in constraints:
        coeffs = const['coefficients']
        op = const['operator']
        val = const['valor']
        # Certificar que coeffs tem 2 elementos
        if len(coeffs) != 2:
             print(f"Aviso: Coeficientes inválidos encontrados em 'is_feasible': {coeffs}")
             continue # Ou levanta um erro? Melhor pular por enquanto.

        expression_val = coeffs[0] * x + coeffs[1] * y

        if op == '<=':
            if expression_val > val + TOLERANCE:
                return False
        elif op == '>=':
            if expression_val < val - TOLERANCE:
                return False
        # Adicione '==' se necessário
    return True

def order_vertices(vertices):
    """Ordena os vértices de um polígono convexo em sentido anti-horário."""
    if not vertices or len(vertices) < 3:
        return vertices # Retorna como está se não formar um polígono

    # Calcular o centroide
    try:
        center_x = sum(p[0] for p in vertices) / len(vertices)
        center_y = sum(p[1] for p in vertices) / len(vertices)
    except (TypeError, IndexError):
         print(f"Erro ao calcular centroide para vértices: {vertices}")
         return vertices # Retorna sem ordenar em caso de erro

    # Calcular o ângulo de cada vértice em relação ao centroide
    vertices_with_angles = []
    for vertex in vertices:
         try:
            x, y = vertex
            angle = math.atan2(y - center_y, x - center_x)
            vertices_with_angles.append(((x, y), angle))
         except (TypeError, IndexError):
              print(f"Erro ao calcular ângulo para vértice: {vertex}")
              continue # Pula vértice inválido

    # Ordenar os vértices pelo ângulo
    vertices_with_angles.sort(key=lambda item: item[1])

    # Retornar apenas os vértices ordenados
    ordered_vertices = [item[0] for item in vertices_with_angles]
    return ordered_vertices

def calculate_feasible_vertices(constraints):
    """
    Calcula os vértices ordenados da região factível definida pelas restrições.

    Args:
        constraints (list): Lista de dicionários de restrição validados.

    Returns:
        list: Lista de listas [x, y] representando os vértices ordenados,
              ou lista vazia se a região for infactível ou ocorrer erro.
    """
    lines = []
    # 1. Adicionar linhas das restrições explícitas
    for const in constraints:
        # Garante que coefficients tem o tamanho esperado
        if len(const.get('coefficients', [])) == 2:
             lines.append(tuple(const['coefficients'] + [const['valor']]))
        else:
            print(f"Aviso: Restrição inválida ignorada no cálculo de vértices: {const}")


    # 2. Adicionar linhas dos eixos (x1=0, x2=0)
    lines.append((1, 0, 0)) # x1 = 0
    lines.append((0, 1, 0)) # x2 = 0

    # 3. Encontrar todas as interseções únicas
    intersections = set()
    if len(lines) >= 2: # Precisa de pelo menos 2 linhas para ter interseções
        for line1, line2 in combinations(lines, 2):
            intersection_point = solve_linear_system(line1, line2)
            if intersection_point:
                # Arredondar para lidar com imprecisões e evitar duplicatas
                rounded_point = (round(intersection_point[0], 7), round(intersection_point[1], 7))
                intersections.add(rounded_point)

    # 4. Filtrar interseções para encontrar vértices factíveis
    feasible_vertices_set = set()
    for point in intersections:
        # Verifica se o ponto satisfaz TODAS as restrições (incluindo x>=0, y>=0 implícito em is_feasible)
        if is_feasible(point, constraints):
            feasible_vertices_set.add(point)


    # 5. Ordenar os vértices factíveis
    # Converter set para lista antes de ordenar
    ordered_vertices_tuples = order_vertices(list(feasible_vertices_set))

    # 6. Converter para lista de listas para JSON
    return [list(p) for p in ordered_vertices_tuples]