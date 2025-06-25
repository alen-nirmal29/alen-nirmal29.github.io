from django.urls import path
from .views import UserProfileDetailView, delete_account

urlpatterns = [
    path('profile/', UserProfileDetailView.as_view(), name='user-profile-detail'),
    path('delete-account/', delete_account, name='delete-account'),
]
