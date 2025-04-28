from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pulp as plp

class SolverView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            objective = data.get('objective')
            objective_func = data.get('objective_func')
            constraints = data.get('constraints')

            result = self._solve_problem(objective, objective_func, constraints)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def _define_objective(self, objective):
        if objective.lower() == "max":
            return plp.LpProblem("Problema de Programação Linear", plp.LpMaximize)
        else:
            return plp.LpProblem("Problema de Programação Linear", plp.LpMinimize)

    def _create_variables(self, n):
        variables = []
        for i in range(n):
            var = plp.LpVariable(f"x{i+1}", lowBound=0, cat='Integer')
            variables.append(var)
        return variables

    def _add_objective_function(self, problem, variables, coefficients):
        problem += plp.lpSum(
            [coef * var for coef, var in zip(coefficients, variables)]
        )

    def _add_constraints(self, problem, variables, constraints):
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

    def _solve_and_collect(self, problem, variables):
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

    def _solve_problem(self, objective, objective_func, constraints):
        problem = self._define_objective(objective)
        variables = self._create_variables(len(objective_func))
        self._add_objective_function(problem, variables, objective_func)
        self._add_constraints(problem, variables, constraints)
        result = self._solve_and_collect(problem, variables)
        return result
