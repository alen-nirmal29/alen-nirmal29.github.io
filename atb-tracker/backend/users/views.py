from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Member
from .serializers import MemberSerializer
from .utils import get_tokens_for_user
from .authentication import UserDataIsolationMixin
from rest_framework import serializers

class MemberListCreateView(generics.ListCreateAPIView):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # Generate JWT tokens for the new user
        user = Member.objects.get(id=response.data['id'])
        tokens = get_tokens_for_user(user)
        response.data = {
            'notification': 'Member added successfully!',
            'member': response.data,
            'tokens': tokens
        }
        return response

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Method "GET" not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Member.objects.get(email=email)
            if user.check_password(password):
                tokens = get_tokens_for_user(user)
                return Response({
                    'message': 'Login successful',
                    'tokens': tokens,
                    'user': MemberSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        except Member.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
