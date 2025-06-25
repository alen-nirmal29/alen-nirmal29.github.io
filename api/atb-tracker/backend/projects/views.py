from django.shortcuts import render
from rest_framework import generics, permissions, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from .models import Project, Client, Task, TimeEntry, Tag
from .serializers import ProjectSerializer, ClientSerializer, TaskSerializer, TimeEntrySerializer, TagSerializer
from users.authentication import UserDataIsolationMixin

class ProjectListCreateView(UserDataIsolationMixin, generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

class ProjectRetrieveUpdateDestroyView(UserDataIsolationMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

class ClientListCreateView(UserDataIsolationMixin, generics.ListCreateAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

class ClientRetrieveUpdateDestroyView(UserDataIsolationMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

class TaskListCreateView(UserDataIsolationMixin, generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

class TaskRetrieveUpdateDestroyView(UserDataIsolationMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

class CompletedTaskCountView(UserDataIsolationMixin, APIView):
    """
    Returns the number of completed tasks for the authenticated user
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        start = request.GET.get('start')
        end = request.GET.get('end')
        qs = Task.objects.filter(user=request.user, status__iexact="Completed")
        if start:
            qs = qs.filter(created_at__gte=start)
        if end:
            qs = qs.filter(created_at__lte=end)
        return Response({"completed_tasks": qs.count()})

class CompletedProjectCountView(UserDataIsolationMixin, APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        start = request.GET.get('start')
        end = request.GET.get('end')
        qs = Project.objects.filter(user=request.user, status__iexact="Completed")
        if start:
            qs = qs.filter(created_at__gte=start)
        if end:
            qs = qs.filter(created_at__lte=end)
        return Response({"completed_projects": qs.count()})

class TimeEntryListCreateView(UserDataIsolationMixin, generics.ListCreateAPIView):
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TimeEntry.objects.filter(user=self.request.user)
        entry_type = self.request.query_params.get('type')
        if entry_type:
            queryset = queryset.filter(type=entry_type)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("[TimeEntryListCreateView] Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class TimeEntryRetrieveUpdateDestroyView(UserDataIsolationMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]

class TagViewSet(UserDataIsolationMixin, viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
