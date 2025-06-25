from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import hello_world, TimeEntryViewSet, PomodoroSessionViewSet, TagViewSet

router = DefaultRouter()
router.register(r'time-entries', TimeEntryViewSet, basename='timeentry')
router.register(r'pomodoros', PomodoroSessionViewSet, basename='pomodoros')
router.register(r'projects/tags', TagViewSet, basename='tag')

urlpatterns = [
    path('hello/', hello_world),
    path('', include(router.urls)),
]