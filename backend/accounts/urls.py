from django.urls import path
from .views import RegisterView, CustomLoginView, MeView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('users/', UserListView.as_view(), name='user-list'),
]
