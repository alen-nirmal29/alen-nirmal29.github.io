from rest_framework import viewsets, filters
from .models import TimeEntry, PomodoroSession
from .serializers import TimeEntrySerializer, PomodoroSessionSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = TimeEntry.objects.all().order_by('-date', '-start_time')
    serializer_class = TimeEntrySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date', 'project']
    ordering_fields = ['date', 'start_time']

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
import logging

@method_decorator(csrf_exempt, name='dispatch')
class PomodoroSessionViewSet(viewsets.ModelViewSet):
    queryset = PomodoroSession.objects.all().order_by('-start_time')
    serializer_class = PomodoroSessionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['start_time', 'end_time']
    ordering_fields = ['start_time']

    def create(self, request, *args, **kwargs):
        logger = logging.getLogger("pomodoro")
        logger.warning(f"Pomodoro POST data: {request.data}")
        response = super().create(request, *args, **kwargs)
        if hasattr(response, 'data') and response.status_code >= 400:
            logger.error(f"Pomodoro serializer errors: {getattr(response, 'data', None)}")
        return response

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django backend!"})