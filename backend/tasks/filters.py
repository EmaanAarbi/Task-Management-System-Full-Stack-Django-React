import django_filters
from .models import Task


class TaskFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name='status')
    priority = django_filters.CharFilter(field_name='priority')
    due_date_before = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    due_date_after = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    assigned_to_me = django_filters.BooleanFilter(method='filter_assigned_to_me')
    created_by_me = django_filters.BooleanFilter(method='filter_created_by_me')
    is_overdue = django_filters.BooleanFilter(method='filter_overdue')

    class Meta:
        model = Task
        fields = ['status', 'priority', 'assigned_to', 'created_by']

    def filter_assigned_to_me(self, queryset, name, value):
        if value:
            return queryset.filter(assigned_to=self.request.user)
        return queryset

    def filter_created_by_me(self, queryset, name, value):
        if value:
            return queryset.filter(created_by=self.request.user)
        return queryset

    def filter_overdue(self, queryset, name, value):
        from django.utils import timezone
        today = timezone.now().date()
        if value:
            return queryset.exclude(status=Task.Status.COMPLETED).filter(due_date__lt=today)
        return queryset
