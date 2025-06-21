from rest_framework import authentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from .models import Member

class UserDataIsolationMixin:
    """Mixin to ensure user data isolation in views"""
    
    def get_queryset(self):
        """Filter queryset by current user"""
        queryset = super().get_queryset()
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            if hasattr(queryset.model, 'user'):
                return queryset.filter(user=self.request.user)
        return queryset.none()
    
    def perform_create(self, serializer):
        """Automatically assign user to new objects"""
        serializer.save(user=self.request.user) 