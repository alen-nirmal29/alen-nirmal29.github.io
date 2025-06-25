from django.core.management.base import BaseCommand
from projects.models import TimeEntry

class Command(BaseCommand):
    help = 'Delete or migrate Pomodoro entries from TimeEntry before moving to a new Pomodoro model.'

    def add_arguments(self, parser):
        parser.add_argument('--delete', action='store_true', help='Delete all Pomodoro entries')

    def handle(self, *args, **options):
        pomodoros = TimeEntry.objects.filter(type='pomodoro')
        count = pomodoros.count()
        if options['delete']:
            pomodoros.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {count} Pomodoro entries from TimeEntry.'))
        else:
            self.stdout.write(self.style.WARNING(f'Found {count} Pomodoro entries. Use --delete to remove them.')) 