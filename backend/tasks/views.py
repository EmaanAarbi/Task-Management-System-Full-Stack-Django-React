from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import TaskFilter
from .models import Task
from .serializers import TaskSerializer, TaskListSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for tasks. All endpoints require authentication.

    Filtering:
      ?status=pending|in_progress|completed|cancelled
      ?priority=low|medium|high|urgent
      ?assigned_to_me=true
      ?created_by_me=true
      ?is_overdue=true
      ?due_date_before=YYYY-MM-DD
      ?due_date_after=YYYY-MM-DD

    Search:
      ?search=<text>   (searches title + description)

    Ordering:
      ?ordering=due_date,-created_at,priority,status

    Pagination:
      ?page=N&page_size=N
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        # Users see tasks they created OR are assigned to
        return (
            Task.objects.select_related('created_by', 'assigned_to')
            .filter(Q(created_by=user) | Q(assigned_to=user))
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['patch'], url_path='complete')
    def mark_complete(self, request, pk=None):
        task = self.get_object()
        task.status = Task.Status.COMPLETED
        from django.utils import timezone
        task.completed_at = timezone.now()
        task.save(update_fields=['status', 'completed_at', 'updated_at'])
        return Response(TaskSerializer(task, context={'request': request}).data)

    @action(detail=True, methods=['patch'], url_path='reopen')
    def reopen(self, request, pk=None):
        task = self.get_object()
        task.status = Task.Status.PENDING
        task.completed_at = None
        task.save(update_fields=['status', 'completed_at', 'updated_at'])
        return Response(TaskSerializer(task, context={'request': request}).data)

    @action(detail=True, methods=['patch'], url_path='assign')
    def assign(self, request, pk=None):
        task = self.get_object()
        user_id = request.data.get('assigned_to_id')
        if user_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(pk=user_id)
                task.assigned_to = user
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            task.assigned_to = None
        task.save(update_fields=['assigned_to', 'updated_at'])
        return Response(TaskSerializer(task, context={'request': request}).data)


class TaskStatsView(APIView):
    """GET /api/tasks/stats/ — summary counts for the dashboard."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        user = request.user
        today = timezone.now().date()

        base = Task.objects.filter(Q(created_by=user) | Q(assigned_to=user))

        return Response({
            'total': base.count(),
            'pending': base.filter(status=Task.Status.PENDING).count(),
            'in_progress': base.filter(status=Task.Status.IN_PROGRESS).count(),
            'completed': base.filter(status=Task.Status.COMPLETED).count(),
            'overdue': base.exclude(status=Task.Status.COMPLETED).filter(due_date__lt=today).count(),
            'assigned_to_me': base.filter(assigned_to=user).count(),
            'created_by_me': base.filter(created_by=user).count(),
        })
