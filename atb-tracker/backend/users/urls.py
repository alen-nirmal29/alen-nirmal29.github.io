from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MemberListCreateView, LoginView, UserProfileView

urlpatterns = [
    path('members/', MemberListCreateView.as_view(), name='member-list-create'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
