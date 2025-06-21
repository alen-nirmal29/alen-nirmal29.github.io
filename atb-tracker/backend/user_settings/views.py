from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models import Member
from .models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework.exceptions import NotAuthenticated

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user:
            profile, created = UserProfile.objects.get_or_create(user=user, defaults={
                'email': user.email or '',
                'first_name': user.name.split()[0] if user.name else '',
                'last_name': ' '.join(user.name.split()[1:]) if user.name and len(user.name.split()) > 1 else '',
                'avatar': user.picture or '',
            })
            return profile
        else:
            raise NotAuthenticated("Authentication credentials were not provided or are invalid.")

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
