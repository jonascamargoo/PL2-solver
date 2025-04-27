# from django.shortcuts import render
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status

# # Create your views here.

# class SolverView(APIView):
#     def post(self, request):
#         try:
#             # Aqui receberemos os dados do problema
#             # Por enquanto, apenas retornamos os dados recebidos
#             return Response({
#                 'status': 'success',
#                 'data': request.data,
#                 'message': 'Problema recebido com sucesso'
#             }, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({
#                 'status': 'error',
#                 'message': str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)


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

