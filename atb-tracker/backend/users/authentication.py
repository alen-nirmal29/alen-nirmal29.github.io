from rest_framework import authentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from .models import Member
import logging

logger = logging.getLogger(__name__)

class CustomJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication with better error handling"""
    
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        try:
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None

            validated_token = self.get_validated_token(raw_token)
            
            user = self.get_user(validated_token)
            
            return (user, validated_token)
            
        except InvalidToken as e:
            logger.error(f"Invalid JWT token: {e}")
            return None
        except TokenError as e:
            logger.error(f"JWT token error: {e}")
            return None
        except Exception as e:
            logger.error(f"JWT authentication error: {e}")
            return None

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