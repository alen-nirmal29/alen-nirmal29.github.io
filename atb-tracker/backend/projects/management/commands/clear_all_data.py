from django.core.management.base import BaseCommand
from django.db import transaction
from projects.models import Project, Client, Task, TimeEntry, Tag
from pomodoro.models import PomodoroSession
from users.models import Member

class Command(BaseCommand):
    help = 'Clear all existing data from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-users',
            action='store_true',
            help='Keep user accounts but clear all other data',
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            if options['keep_users']:
                self.stdout.write('Clearing all data except user accounts...')
                
                # Clear all data except users
                projects_deleted = Project.objects.all().delete()[0]
                clients_deleted = Client.objects.all().delete()[0]
                tasks_deleted = Task.objects.all().delete()[0]
                time_entries_deleted = TimeEntry.objects.all().delete()[0]
                tags_deleted = Tag.objects.all().delete()[0]
                pomodoro_deleted = PomodoroSession.objects.all().delete()[0]
                
                self.stdout.write(f'Deleted {projects_deleted} projects')
                self.stdout.write(f'Deleted {clients_deleted} clients')
                self.stdout.write(f'Deleted {tasks_deleted} tasks')
                self.stdout.write(f'Deleted {time_entries_deleted} time entries')
                self.stdout.write(f'Deleted {tags_deleted} tags')
                self.stdout.write(f'Deleted {pomodoro_deleted} pomodoro sessions')
                
                self.stdout.write(
                    self.style.SUCCESS('All data cleared except user accounts!')
                )
            else:
                self.stdout.write('Clearing ALL data including user accounts...')
                
                # Clear everything including users
                projects_deleted = Project.objects.all().delete()[0]
                clients_deleted = Client.objects.all().delete()[0]
                tasks_deleted = Task.objects.all().delete()[0]
                time_entries_deleted = TimeEntry.objects.all().delete()[0]
                tags_deleted = Tag.objects.all().delete()[0]
                pomodoro_deleted = PomodoroSession.objects.all().delete()[0]
                users_deleted = Member.objects.all().delete()[0]
                
                self.stdout.write(f'Deleted {projects_deleted} projects')
                self.stdout.write(f'Deleted {clients_deleted} clients')
                self.stdout.write(f'Deleted {tasks_deleted} tasks')
                self.stdout.write(f'Deleted {time_entries_deleted} time entries')
                self.stdout.write(f'Deleted {tags_deleted} tags')
                self.stdout.write(f'Deleted {pomodoro_deleted} pomodoro sessions')
                self.stdout.write(f'Deleted {users_deleted} users')
                
                self.stdout.write(
                    self.style.SUCCESS('ALL data cleared including user accounts!')
                ) 