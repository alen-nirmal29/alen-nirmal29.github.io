from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import PomodoroSession
from .serializers import PomodoroSessionSerializer
from users.authentication import UserDataIsolationMixin

class PomodoroSessionListCreateView(UserDataIsolationMixin, generics.ListCreateAPIView):
    queryset = PomodoroSession.objects.all()
    serializer_class = PomodoroSessionSerializer
    permission_classes = [IsAuthenticated]

class PomodoroSessionRetrieveUpdateDestroyView(UserDataIsolationMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = PomodoroSession.objects.all()
    serializer_class = PomodoroSessionSerializer
    permission_classes = [IsAuthenticated] 