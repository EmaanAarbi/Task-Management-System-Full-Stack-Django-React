from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskStatsView

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

urlpatterns = [
    path('stats/', TaskStatsView.as_view(), name='task-stats'),
    path('', include(router.urls)),
]
