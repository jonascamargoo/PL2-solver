import pulp as plp

def solve_problem(objective, objective_func, constraints):
    """
    Resolve o problema de Programação Linear usando PuLP.

    Args:
        objective (str): 'max' ou 'min'.
        objective_func (list): Lista de coeficientes da função objetivo [c1, c2].
        constraints (list): Lista de dicionários de restrição, cada um com
                           'coefficients' [a, b], 'operator' '<=' ou '>=', 'valor' rhs.

    Returns:
        dict: Dicionário com os resultados da solução ('status', 'optimal_value'?, 'variables'?).
    """
    try:
        # Cria uma instância do problema PuLP
        prob = plp.LpProblem("LP_Problem", plp.LpMaximize if objective == 'max' else plp.LpMinimize)

        # Define as variáveis de decisão (assume x1, x2)
        # Nota: Os nomes 'x1', 'x2' são usados internamente e no resultado.
        x1 = plp.LpVariable("x1", lowBound=0)
        x2 = plp.LpVariable("x2", lowBound=0)

        # Adiciona a função objetivo ao problema
        prob += objective_func[0] * x1 + objective_func[1] * x2, "Objective Function"

        # Adiciona as restrições ao problema
        for i, const in enumerate(constraints):
            expr = const['coefficients'][0] * x1 + const['coefficients'][1] * x2
            op = const['operator']
            val = const['valor']
            constraint_name = f"Constraint_{i}" # Nome único para cada restrição
            if op == '<=':
                prob += expr <= val, constraint_name
            elif op == '>=':
                prob += expr >= val, constraint_name
            # Adicione '==' se necessário

        # Manda o PuLP resolver o problema
        prob.solve()

        # Prepara o dicionário de resultados
        result = {
            "status": plp.LpStatus[prob.status]
        }
        if result["status"] == 'Optimal':
            result["optimal_value"] = plp.value(prob.objective)
            # Garante que mesmo que uma variável não seja usada, ela apareça com valor 0
            result["variables"] = {
                'x1': x1.varValue if x1.varValue is not None else 0.0,
                'x2': x2.varValue if x2.varValue is not None else 0.0
            }
            # Alternativa mais geral se houvessem mais variáveis:
            # result["variables"] = {v.name: v.varValue for v in prob.variables()}
        elif result["status"] in ['Infeasible', 'Unbounded']:
             result["variables"] = {} # Ou talvez {'x1': None, 'x2': None}? Fica vazio por consistência.
             result["optimal_value"] = None
        else: # Not Solved, Undefined, Error?
             result["variables"] = {}
             result["optimal_value"] = None
             result["error"] = f"Solver terminou com status inesperado: {result['status']}"


        return result

    except Exception as e:
        print(f"Erro durante a execução do PuLP: {e}")
        # Em caso de erro no PuLP, retorna um status de erro
        return {
            "status": "Error",
            "error": f"Erro interno no solver PuLP: {str(e)}",
            "variables": {},
            "optimal_value": None
        }