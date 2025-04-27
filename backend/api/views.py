from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

class SolverView(APIView):
    def post(self, request):
        try:
            # Aqui receberemos os dados do problema
            # Por enquanto, apenas retornamos os dados recebidos
            return Response({
                'status': 'success',
                'data': request.data,
                'message': 'Problema recebido com sucesso'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


# exemplo de request
# curl -X POST http://localhost:8000/api/solve/ \
# -H "Content-Type: application/json" \
# -d '{
#     "objetivo": "maximizar",
#     "funcao_objetivo": [2, 3],
#     "restricoes": [
#         {"coeficientes": [1, 1], "operador": "<=", "valor": 4},
#         {"coeficientes": [2, 1], "operador": "<=", "valor": 5}
#     ]
# }'


# eu tenho meu angular funcionando e minha api django também funcionando, agora irei implementar a lógica. o que minha aplicação fará é a implementação do método gráfico de programação linear. portanto, preciso criar uma lógica no django que fará isso e preciso conectar o django com o angular. 



# class SolverView(APIView):
#     def post(self, request):
#         try:
#             dados = request.data
#             resultado = solve_problem(
#                 objetivo=dados['objetivo'],
#                 funcao_objetivo=dados['funcao_objetivo'],
#                 restricoes=dados['restricoes']
#             )
#             return Response({
#                 'status': 'success',
#                 'data': resultado,
#                 'message': 'Problema resolvido com sucesso'
#             }, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({
#                 'status': 'error',
#                 'message': str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)