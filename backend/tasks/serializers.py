from django.utils import timezone
from rest_framework import serializers
from accounts.serializers import UserMiniSerializer
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)
    assigned_to = UserMiniSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        source='assigned_to',
        queryset=__import__('django.contrib.auth', fromlist=['get_user_model']).get_user_model().objects.all(),
        allow_null=True,
        required=False,
        write_only=False,
    )
    is_overdue = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'status', 'status_display',
            'priority', 'priority_display', 'due_date', 'is_overdue',
            'created_by', 'assigned_to', 'assigned_to_id',
            'created_at', 'updated_at', 'completed_at',
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at', 'completed_at')

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        task = super().create(validated_data)
        return task

    def update(self, instance, validated_data):
        # Auto-set completed_at when status flips to completed
        if 'status' in validated_data:
            if validated_data['status'] == Task.Status.COMPLETED and instance.status != Task.Status.COMPLETED:
                validated_data['completed_at'] = timezone.now()
            elif validated_data['status'] != Task.Status.COMPLETED:
                validated_data['completed_at'] = None
        return super().update(instance, validated_data)


class TaskListSerializer(serializers.ModelSerializer):
    """Leaner serializer for list views."""
    created_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'status', 'priority', 'due_date', 'is_overdue',
            'created_by_name', 'assigned_to_name', 'created_at', 'completed_at',
        )

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else None

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.full_name if obj.assigned_to else None
