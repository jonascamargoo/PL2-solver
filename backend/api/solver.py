import pulp as plp

def define_objective(objective):
    if objective.lower() == "max":
        return plp.LpProblem("Problema de Programação Linear", plp.LpMaximize)
    else:
        return plp.LpProblem("Problema de Programação Linear", plp.LpMinimize)
    
def create_variables(n):
    variables = []
    for i in range(n):
        var = plp.LpVariable(f"x{i+1}", lowBound=0, cat='Integer')
        variables.append(var)
    return variables

def add_objective_function(problem, variables, coefficients):
    problem += plp.lpSum(
        [coef * var for coef, var in zip(coefficients, variables)]
    )
    
def add_constraints(problem, variables, constraints):
    for constraint in constraints:
        coefficient = constraint["coefficients"]
        operator = constraint["operator"]
        value = constraint["valor"]

        expression = plp.lpSum([coef * var for coef, var in zip(coefficient, variables)])

        if operator == "<=":
            problem += (expression <= value)
        elif operator == ">=":
            problem += (expression >= value)
        elif operator == "=":
            problem += (expression == value)

def solve_and_collect(problem, variables):
    problem.solve()

    var_values = {}
    for var in variables:
        var_values[var.name] = var.varValue

    valor_otimo = plp.value(problem.objective)
    status = plp.LpStatus[problem.status]

    return {
        "variaveis": var_values,
        "valor_otimo": valor_otimo,
        "status": status
    }
    
def solve_problem(objective, objective_func, constraints):
    problem = define_objective(objective)
    variables = create_variables(len(objective_func))
    add_objective_function(problem, variables, objective_func)
    add_constraints(problem, variables, constraints)
    result = solve_and_collect(problem, variables)
    return result


# exemplo de uso
# resultado = solve_problem(
#     objective="max",
#     objective_func=[3000, 5000],
#     constraints=[
#         {"coefficients": [1, 0], "operator": "<=", "value": 4},
#         {"coefficients": [0, 2], "operator": ">=", "value": 12},
#         {"coefficients": [3, 2], "operator": "<=", "value": 18}
#     ]
# )

# print(resultado)