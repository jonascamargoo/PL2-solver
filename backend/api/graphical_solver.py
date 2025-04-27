# import pulp as plp

# # Args:
# #objetivo (str): 'maximizar' ou 'minimizar'
# #funcao_objetivo (list): coeficientes da função objetivo
# #constrains (list): lista de restrições, cada uma com coeficientes, operador e valor
# def solve_problem(objective: str, objective_func: list, constrains:list):
#     if objective == "max":
#         problem = plp.LpProblem("Problema de Programação Linear", plp.LpMaximize)
#     else:
#         problem = plp.LpProblem("Problema de Programação Linear", plp.LpMinimize)

#     # Monta a função objetivo
#     problem += plp.lpSum(
#         [coef * var for coef, var in zip(objective_func, variables)]
#     )

   
# def constrains(constrains:list):
#     for constrain in constrains:
#         coefficients = constrain["coefficients"]
#         operador = constrain["operator"]
#         value = constrain["value"]

#         expression = plp.lpSum(
#             [coef * var for coef, var in zip(coefficients, variables)]
#         )

#         if operador == "<=":
#             prob += (expression <= value)
#         elif operador == ">=":
#             prob += (expression >= value)
#         elif operador == "=":
#             prob += (expression == value)
    
    
#     # max_z = plp.LpProblem("Maximize Z", plp.LpMaximize)
#     # """
#     # Resolve um problema de programação linear usando o método gráfico.
    


#     # Returns:
#     #     dict: resultados do problema (ex: pontos viáveis, solução ótima, etc)
#     # """
#     # # Aqui você implementa a lógica do método gráfico
#     # # Exemplo básico:
#     # return {
#     #     'pontos_viaveis': [],
#     #     'solucao_otima': None
#     # }
    
# def constrains(restricoes):
    

# import pulp as plp

# max_z = plp.LpProblem("Maximize Z", plp.LpMaximize)

# # definindo as variaveis
# x1 = plp.LpVariable("x1", lowBound=0, cat='Integer')
# x2 = plp.LpVariable("x2", lowBound=0, cat='Integer')

# # funcao objetivo
# max_z += 3000*x1 + 5000*x2

# # restricoes

# max_z += x1 <= 4
# max_z += 2*x2 >= 12
# max_z += 3*x1 + 2*x2 <= 18

# # resolvendo
# max_z.solve()

# print(x1.varValue)
# print(x2.varValue)

# valor_otimo = plp.value(max_z.objective)
# print(f"Valor ótimo: {valor_otimo}")