from rest_framework import serializers
from .models import PomodoroSession

class PomodoroSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PomodoroSession
        fields = ['id', 'start_time', 'end_time', 'duration', 'break_duration', 'cycles', 'notes', 'created_at', 'updated_at']