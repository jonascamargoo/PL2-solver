from django.urls import path
from .views import SolverView

urlpatterns = [
    path('solve/', SolverView.as_view(), name='solve'),
] 