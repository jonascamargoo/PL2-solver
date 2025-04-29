import pulp as plp
import matplotlib.pyplot as plt
import numpy as np

# --- Definição e Resolução do Problema com PuLP ---
max_z = plp.LpProblem("Maximize Z", plp.LpMaximize)

# Definindo as variáveis (removido cat='Integer' para visualização da região LP padrão)
# Se precisar da solução inteira, PuLP a encontrará, mas a região factível é definida pelas restrições contínuas.
x1 = plp.LpVariable("x1", lowBound=0)
x2 = plp.LpVariable("x2", lowBound=0)

# Função objetivo
max_z += 3000*x1 + 5000*x2, "Objective Function"

# Restrições
max_z += x1 <= 4, "Constraint 1"
max_z += 2*x2 >= 12, "Constraint 2" # Equivalente a x2 >= 6
max_z += 3*x1 + 2*x2 <= 18, "Constraint 3"

# Resolvendo
max_z.solve()

# Print da solução ótima encontrada pelo PuLP
print("--- Solução Ótima (PuLP) ---")
print(f"Status: {plp.LpStatus[max_z.status]}")
if plp.LpStatus[max_z.status] == 'Optimal':
    optimal_x1 = x1.varValue
    optimal_x2 = x2.varValue
    optimal_value = plp.value(max_z.objective)
    print(f"x1 = {optimal_x1}")
    print(f"x2 = {optimal_x2}")
    print(f"Valor ótimo Z = {optimal_value}")
else:
    print("Não foi encontrada uma solução ótima.")
    optimal_x1, optimal_x2 = None, None # Define como None se não for ótimo

print("\n--- Plotando a Região Factível ---")

# --- Preparação para Plotagem com Matplotlib ---

# Criar um range de valores para x1
x1_vals = np.linspace(0, 8, 400) # Ajuste o range conforme necessário

# Calcular os valores correspondentes de x2 para cada linha de restrição
# x1 = 4 (Linha Vertical)
# x2 = 6 (Linha Horizontal)
# 3*x1 + 2*x2 = 18  =>  2*x2 = 18 - 3*x1  => x2 = 9 - 1.5*x1
x2_vals_c3 = 9 - 1.5 * x1_vals

plt.figure(figsize=(10, 8))

# Plotar as linhas de restrição
plt.axvline(x=4, color='red', linestyle='--', label='x1 <= 4 (Constraint 1)')
plt.axhline(y=6, color='blue', linestyle='--', label='x2 >= 6 (Constraint 2)')
plt.plot(x1_vals, x2_vals_c3, color='green', linestyle='--', label='3x1 + 2x2 <= 18 (Constraint 3)')

# --- Identificar e Plotar a Região Factível ---

# Vértices calculados manualmente (ou por análise das interseções que satisfazem tudo)
# Pontos: (0,6), (2,6), (0,9)
vertices_x = [0, 2, 0]
vertices_y = [6, 6, 9]

# Preencher a região factível
plt.fill(vertices_x, vertices_y, 'skyblue', alpha=0.5, label='Região Factível')

# Adicionar os pontos dos vértices ao gráfico para clareza
plt.plot(vertices_x, vertices_y, 'ko') # 'ko' = black circle marker
# Anotar os vértices
vertex_labels = ['(0, 6)', '(2, 6)', '(0, 9)']
for i, txt in enumerate(vertex_labels):
    # Adiciona um pequeno deslocamento para não sobrepor o ponto
    plt.annotate(txt, (vertices_x[i] + 0.1, vertices_y[i] + 0.1))

# Plotar o ponto ótimo encontrado pelo PuLP (se existir)
if optimal_x1 is not None and optimal_x2 is not None:
    plt.plot(optimal_x1, optimal_x2, 'ro', markersize=10, label=f'Ponto Ótimo ({optimal_x1}, {optimal_x2})')
    plt.annotate('Ótimo', (optimal_x1 + 0.1, optimal_x2 - 0.2), color='red')


# --- Configurações Finais do Gráfico ---
plt.xlim(-0.5, 8) # Limites do eixo X
plt.ylim(-0.5, 11) # Limites do eixo Y
plt.xlabel("X₁")
plt.ylabel("X₂")
plt.title("Visualização da Região Factível e Ponto Ótimo")
plt.grid(True)
plt.legend(loc='upper right')
plt.axhline(0, color='black', linewidth=0.5) # Eixo X
plt.axvline(0, color='black', linewidth=0.5) # Eixo Y
plt.show()