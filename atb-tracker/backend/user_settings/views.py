from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models import Member
from .models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework.exceptions import NotAuthenticated
import logging
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

logger = logging.getLogger(__name__)

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        logger.debug(f"Request user: {self.request.user}")
        logger.debug(f"Request user is authenticated: {self.request.user.is_authenticated}")
        logger.debug(f"Request headers: {dict(self.request.headers)}")
        
        user = self.request.user
        if not hasattr(user, 'profile'):
            profile, created = UserProfile.objects.get_or_create(user=user)
        else:
            profile = user.profile
        
        logger.debug(f"Profile retrieved/created for user: {user.email}")
        return profile

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def partial_update(self, request, *args, **kwargs):
        logger.info(f"User {request.user} is updating their profile.")
        logger.debug(f"Incoming data: {request.data}")
        logger.debug(f"Files received: {request.FILES}")
        
        instance = self.get_object()
        
        # Handle file upload separately
        avatar_file = request.FILES.get('avatar')
        if avatar_file:
            logger.debug(f"Avatar file received: {avatar_file.name}, size: {avatar_file.size}")
            # The serializer will handle the file saving
        else:
            logger.debug("No avatar file received")
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                self.perform_update(serializer)
                logger.info(f"Profile for user {request.user} updated successfully.")
                logger.debug(f"Updated profile data: {serializer.data}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Error updating profile: {e}", exc_info=True)
                return Response({"error": "Failed to update profile."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.error(f"Profile update validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        # ... (get method logic)
        return super().get(request, *args, **kwargs)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Delete user account and all associated data"""
    user = request.user
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Delete user profile
        try:
            profile = UserProfile.objects.get(user=user)
            profile.delete()
        except UserProfile.DoesNotExist:
            pass
        
        # Delete user
        user.delete()
        
        return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Failed to delete account: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
