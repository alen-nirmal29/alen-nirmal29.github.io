from django.db import models
from users.models import Member

class PomodoroSession(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration = models.IntegerField()  # in minutes
    break_duration = models.IntegerField(default=0)  # in minutes
    cycles = models.IntegerField(default=1)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='pomodoro_sessions')

    def __str__(self):
        return f"Pomodoro: {self.start_time} - {self.end_time} ({self.duration} min, {self.cycles} cycles)" 