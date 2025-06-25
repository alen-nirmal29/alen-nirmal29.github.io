from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectListCreateView, ProjectRetrieveUpdateDestroyView, ClientListCreateView, ClientRetrieveUpdateDestroyView,
    TaskListCreateView, TaskRetrieveUpdateDestroyView, CompletedTaskCountView, CompletedProjectCountView,
    TimeEntryListCreateView, TimeEntryRetrieveUpdateDestroyView, TagViewSet
)

router = DefaultRouter()
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<int:pk>/', ProjectRetrieveUpdateDestroyView.as_view(), name='project-detail'),
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientRetrieveUpdateDestroyView.as_view(), name='client-detail'),
    # Task endpoints
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskRetrieveUpdateDestroyView.as_view(), name='task-detail'),
    path('tasks/completed-count/', CompletedTaskCountView.as_view(), name='completed-task-count'),
    path('completed-count/', CompletedProjectCountView.as_view(), name='completed-project-count'),
    # TimeEntry endpoints
    path('time-entries/', TimeEntryListCreateView.as_view(), name='timeentry-list-create'),
    path('time-entries/<int:pk>/', TimeEntryRetrieveUpdateDestroyView.as_view(), name='timeentry-detail'),
    # Tag endpoints
    path('', include(router.urls)),
]
