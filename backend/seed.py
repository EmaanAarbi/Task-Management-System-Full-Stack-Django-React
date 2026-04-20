"""
Run with:  python seed.py
Creates two demo users + sample tasks so you can explore the app immediately.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from tasks.models import Task
from datetime import date, timedelta

User = get_user_model()

# ── Users ─────────────────────────────────────────────────────
alice = User.objects.filter(email='alice@example.com').first()
if not alice:
    alice = User.objects.create_user(
        username='alice', email='alice@example.com',
        password='pass1234', first_name='Alice', last_name='Dev',
    )
    print('Created Alice')

bob = User.objects.filter(email='bob@example.com').first()
if not bob:
    bob = User.objects.create_user(
        username='bob', email='bob@example.com',
        password='pass1234', first_name='Bob', last_name='Ops',
    )
    print('Created Bob')

today = date.today()

# ── Tasks ─────────────────────────────────────────────────────
samples = [
    dict(title='Set up CI/CD pipeline', description='Configure GitHub Actions for automated testing and deployment.', status='in_progress', priority='high', due_date=today + timedelta(days=3), created_by=alice, assigned_to=bob),
    dict(title='Write API documentation', description='Document all REST endpoints using OpenAPI spec.', status='pending', priority='medium', due_date=today + timedelta(days=7), created_by=alice, assigned_to=alice),
    dict(title='Fix login redirect bug', description='After login, users are sometimes redirected to 404.', status='pending', priority='urgent', due_date=today - timedelta(days=1), created_by=bob, assigned_to=alice),
    dict(title='Design onboarding screens', description='Create wireframes for the new user onboarding flow.', status='completed', priority='medium', due_date=today - timedelta(days=5), created_by=bob, assigned_to=bob),
    dict(title='Upgrade Django to 5.x', description='Review breaking changes and update dependencies.', status='pending', priority='low', due_date=today + timedelta(days=14), created_by=alice, assigned_to=None),
    dict(title='Add email notifications', description='Send email when a task is assigned or completed.', status='pending', priority='medium', due_date=today + timedelta(days=10), created_by=bob, assigned_to=alice),
    dict(title='Performance audit', description='Run Lighthouse and address any performance issues.', status='in_progress', priority='high', due_date=today + timedelta(days=2), created_by=alice, assigned_to=alice),
    dict(title='Write unit tests for tasks API', description='Achieve 80%+ coverage on the tasks app.', status='pending', priority='high', due_date=today + timedelta(days=5), created_by=bob, assigned_to=bob),
]

for s in samples:
    if not Task.objects.filter(title=s['title']).exists():
        Task.objects.create(**s)
        print(f"  + {s['title']}")

print('\nSeed complete.')
print('\nDemo accounts:')
print('  alice@example.com / pass1234')
print('  bob@example.com   / pass1234')
print('  admin@example.com / admin1234')
