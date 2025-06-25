from django.core.management.base import BaseCommand
from django.db import transaction
from projects.models import Project, Client, Task, TimeEntry, Tag
from pomodoro.models import PomodoroSession
from users.models import Member

class Command(BaseCommand):
    help = 'Assign default user to existing data without user ownership'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Get or create a default user
            default_user, created = Member.objects.get_or_create(
                email='default@example.com',
                defaults={
                    'name': 'Default User',
                    'password': 'defaultpassword123'
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created default user: {default_user.email}')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'Using existing default user: {default_user.email}')
                )

            # Update projects
            projects_updated = Project.objects.filter(user__isnull=True).update(user=default_user)
            self.stdout.write(f'Updated {projects_updated} projects')

            # Update clients
            clients_updated = Client.objects.filter(user__isnull=True).update(user=default_user)
            self.stdout.write(f'Updated {clients_updated} clients')

            # Update tasks
            tasks_updated = Task.objects.filter(user__isnull=True).update(user=default_user)
            self.stdout.write(f'Updated {tasks_updated} tasks')

            # Update time entries
            time_entries_updated = TimeEntry.objects.filter(user__isnull=True).update(user=default_user)
            self.stdout.write(f'Updated {time_entries_updated} time entries')

            # Update tags
            tags_updated = Tag.objects.filter(user__isnull=True).update(user=default_user)
            self.stdout.write(f'Updated {tags_updated} tags')

            # Update pomodoro sessions
            pomodoro_updated = PomodoroSession.objects.filter(user__isnull=True).update(user=default_user)
            self.stdout.write(f'Updated {pomodoro_updated} pomodoro sessions')

            self.stdout.write(
                self.style.SUCCESS('Successfully assigned default user to all existing data')
            ) 