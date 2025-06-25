from django.db import models

class TimeEntry(models.Model):
    project = models.CharField(max_length=255)
    description = models.TextField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    date = models.DateField()
    billable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project} ({self.date}) - {self.duration}m"

class PomodoroSession(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    break_duration = models.PositiveIntegerField(null=True, blank=True)
    cycles = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pomodoro {self.start_time} - {self.duration}m"
