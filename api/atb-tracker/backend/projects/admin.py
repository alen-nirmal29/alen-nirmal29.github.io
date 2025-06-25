from django.contrib import admin
from .models import Project, Client, Task, TimeEntry, Tag

# Register your models here.
admin.site.register(Project)
admin.site.register(Client)
admin.site.register(Task)
admin.site.register(TimeEntry)
admin.site.register(Tag)
