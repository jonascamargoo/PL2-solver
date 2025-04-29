from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import traceback

from .serializers import SolverRequestSerializer
from .services import lp_solver_service, geometry_service

class SolveView(APIView):
    """
    View para resolver o problema LP e retornar apenas a solução numérica.
    Endpoint: /api/solve/
    """
    def post(self, request, *args, **kwargs):
        serializer = SolverRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "status": "Error",
                "error": "Dados de entrada inválidos.",
                "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data

        try:
            # Chama o serviço de resolução LP
            solution = lp_solver_service.solve_problem(
                validated_data['objective'],
                validated_data['objective_func'],
                validated_data['constraints']
            )
            return Response(solution, status=status.HTTP_200_OK)

        except Exception as e:
            print("Erro inesperado na SolveView:")
            traceback.print_exc() # Log detalhado do erro no console do servidor
            return Response({
                "status": "Error",
                "error": "Erro interno no servidor ao tentar resolver o problema."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SolvePlotView(APIView):
    """
    View para resolver o problema LP E calcular os vértices da região factível.
    Endpoint: /api/solve_and_plot/
    """
    def post(self, request, *args, **kwargs):
        serializer = SolverRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "status": "Error",
                "error": "Dados de entrada inválidos.",
                "details": serializer.errors,
                "feasible_region_vertices": [] # Inclui campo vazio para consistência da interface
                }, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        constraints = validated_data['constraints'] # Pega as constraints validadas

        try:
            # 1. Chamar o serviço de resolução LP
            solution = lp_solver_service.solve_problem(
                validated_data['objective'],
                validated_data['objective_func'],
                constraints
            )

            # 2. Chamar o serviço de geometria (se a solução LP não deu erro)
            vertices = []
            geometry_error = None
            if solution.get('status') != 'Error': # Checa status retornado pelo solver service
                try:
                    vertices = geometry_service.calculate_feasible_vertices(constraints)

                    # Lógica de aviso para Unbounded/Infeasible (opcional, apenas para log/debug)
                    if solution.get('status') == 'Unbounded' and not vertices:
                         print("Aviso (SolvePlotView): Problema unbounded e nenhum vértice encontrado pela lógica atual.")
                    if solution.get('status') == 'Infeasible' and vertices:
                         print("Aviso (SolvePlotView): Problema Infeasible mas vértices encontrados? Zerando vértices.")
                         vertices = [] # Garante que infactível não retorne vértices

                except Exception as e_geom:
                    geometry_error = f"Erro ao calcular vértices: {str(e_geom)}"
                    print(geometry_error) # Log do erro de geometria

            # 3. Combinar resultados e tratar erro de geometria se houver
            response_data = {**solution, "feasible_region_vertices": vertices}
            if geometry_error:
                 # Adiciona/atualiza a chave de erro na resposta final
                 response_data['error'] = (solution.get('error', '') + f" {geometry_error}").strip()
                 response_data['status'] = 'Error' # Define status geral como Error se geometria falhou

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            # Captura erros inesperados gerais (ex: antes de chamar os serviços)
            print("Erro inesperado na SolvePlotView:")
            traceback.print_exc() # Log detalhado do erro no console do servidor
            return Response({
                "status": "Error",
                "error": "Erro interno no servidor ao processar para plotagem.",
                "feasible_region_vertices": []
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)