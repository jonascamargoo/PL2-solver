from rest_framework import serializers

class ConstraintSerializer(serializers.Serializer):
    # Valida cada item na lista de coeficientes como um número float.
    coefficients = serializers.ListField(
        child=serializers.FloatField(),
        min_length=2,  # Garante que temos pelo menos x1 e x2
        max_length=2,  # Limita a 2 variáveis por enquanto
        help_text="Lista com os coeficientes das variáveis (ex: [3, 2] para 3*x1 + 2*x2)."
    )
    # Valida o operador como uma das escolhas permitidas.
    operator = serializers.ChoiceField(
        choices=['<=', '>='],
        help_text="Operador da restrição ('<=' ou '>=')."
    )
    # Valida o valor do lado direito como um float.
    valor = serializers.FloatField(
        help_text="Valor do lado direito da restrição (b)."
    )

    # Validação a nível de objeto (opcional, mas útil)
    # def validate(self, data):
    #     # Exemplo: alguma validação extra se necessário
    #     return data

class SolverRequestSerializer(serializers.Serializer):
    # Valida o objetivo como 'max' ou 'min'.
    objective = serializers.ChoiceField(
        choices=['max', 'min'],
        help_text="Tipo de otimização ('max' ou 'min')."
    )
    # Valida a função objetivo como uma lista de 2 floats.
    objective_func = serializers.ListField(
        child=serializers.FloatField(),
        min_length=2,
        max_length=2,
        help_text="Lista com os coeficientes da função objetivo (ex: [3000, 5000])."
    )
    # Valida a lista de restrições, onde cada item deve seguir o formato de ConstraintSerializer.
    constraints = serializers.ListField(
        child=ConstraintSerializer(),
        min_length=1, # Deve haver pelo menos uma restrição
        help_text="Lista de objetos de restrição."
    )

    # Validação a nível de objeto (opcional)
    # def validate_constraints(self, value):
    #    if len(value) > 10: # Exemplo: Limitar a 10 restrições
    #        raise serializers.ValidationError("Número máximo de 10 restrições excedido.")
    #    return value