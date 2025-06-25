from django.contrib import admin

from .models import TimeEntry, PomodoroSession

admin.site.register(TimeEntry)
admin.site.register(PomodoroSession)
