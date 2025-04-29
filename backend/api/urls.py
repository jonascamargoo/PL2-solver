from django.urls import path
from .views import SolveView, SolvePlotView

urlpatterns = [
    path('solve/', SolveView.as_view(), name='solve_lp'),
    path('solve_and_plot/', SolvePlotView.as_view(), name='solve_lp_plot'),
]