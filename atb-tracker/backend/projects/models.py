from django.db import models
from users.models import Member

# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='tags')

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ['name', 'user']

class Client(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='clients')
    email = models.EmailField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    currency = models.CharField(max_length=10, blank=True, null=True, default='USD')

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ['name', 'user']

class Project(models.Model):
    name = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, blank=True, null=True, related_name='projects')
    status = models.CharField(max_length=50, default="Planning")
    progress = models.IntegerField(default=0)
    tags = models.ManyToManyField(Tag, blank=True, related_name='projects')
    user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
        ("On Hold", "On Hold"),
    ]
    title = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    assigned_to = models.CharField(max_length=255, blank=True, null=True)  # Could be ForeignKey to User if you have users
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='tasks')

    def __str__(self):
        return f"{self.title} ({self.status})"

class TimeEntry(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="time_entries")
    description = models.TextField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration = models.IntegerField()  # in minutes
    date = models.DateField()
    billable = models.BooleanField(default=False)
    type = models.CharField(max_length=10, choices=[('regular', 'Regular'), ('pomodoro', 'Pomodoro')], default='regular')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='time_entries')

    def __str__(self):
        return f"{self.project.name} - {self.date} ({self.duration} min, {self.type})"
