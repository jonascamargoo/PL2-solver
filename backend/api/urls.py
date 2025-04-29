from django.urls import path
from .views import SolveView, SolvePlotView

urlpatterns = [
    path('solve/', SolveView.as_view(), name='solve_lp'),
    path('solve_and_plot/', SolvePlotView.as_view(), name='solve_lp_plot'),
]


# from django.contrib import admin
# from django.urls import path, include # Adicione 'include'

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/', include('solver_app.urls')), # Mapeia /api/ para as URLs do app
#     # ... outras urls do seu projeto ...
# ]