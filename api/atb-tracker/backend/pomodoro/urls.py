from django.urls import path
from .views import PomodoroSessionListCreateView, PomodoroSessionRetrieveUpdateDestroyView

urlpatterns = [
    path('', PomodoroSessionListCreateView.as_view(), name='pomodoro-list-create'),
    path('<int:pk>/', PomodoroSessionRetrieveUpdateDestroyView.as_view(), name='pomodoro-detail'),
] 