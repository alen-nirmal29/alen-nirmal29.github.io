from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import secrets
import json

from users.models import Member
from users.utils import get_tokens_for_user

@api_view(['POST','GET'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Handle Google authentication for both signup and login
    """
    try:
        data = json.loads(request.body)
        firebase_uid = data.get('firebase_uid')
        email = data.get('email')
        name = data.get('name')
        picture = data.get('picture')
        mode = data.get('mode')  # 'signup' or 'login'
        email_verified = data.get('email_verified', False)

        if not all([firebase_uid, email, name]):
            return Response(
                {'error': 'Missing required fields'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user exists by firebase_uid or email
        user = None
        try:
            user = Member.objects.get(firebase_uid=firebase_uid)
        except Member.DoesNotExist:
            try:
                user = Member.objects.get(email=email)
                # Update firebase_uid if not set
                if not user.firebase_uid:
                    user.firebase_uid = firebase_uid
                    user.save()
            except Member.DoesNotExist:
                # Split name into first_name and last_name
                name_parts = name.split(' ', 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                # Create new user
                user = Member.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    firebase_uid=firebase_uid,
                    picture=picture,
                    provider='google',
                    email_verified=email_verified
                )

        # Generate JWT tokens
        tokens = get_tokens_for_user(user)

        # Prepare user data for response
        user_data = {
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'email': user.email,
            'picture': user.picture,
            'provider': user.provider,
            'email_verified': user.email_verified,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }

        return Response({
            'user': user_data,
            'tokens': tokens,
            'message': f"User {'registered' if mode == 'signup' else 'logged in'} successfully"
        }, status=status.HTTP_200_OK)

    except json.JSONDecodeError:
        return Response(
            {'error': 'Invalid JSON data'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST','GET'])
@permission_classes([AllowAny])
def verify_token(request):
    """
    Verify JWT authentication token
    """
    try:
        data = json.loads(request.body)
        token = data.get('token')

        if not token:
            return Response(
                {'error': 'Token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use the JWT token verification from users.utils
        from users.utils import validate_token, get_user_from_token
        
        is_valid, payload = validate_token(token)
        if is_valid:
            user = get_user_from_token(token)
            if user:
                user_data = {
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}".strip(),
                    'email': user.email,
                    'picture': user.picture,
                    'provider': user.provider,
                    'email_verified': user.email_verified,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                }

                return Response({
                    'user': user_data,
                    'valid': True
                }, status=status.HTTP_200_OK)

        return Response(
            {'error': 'Invalid or expired token'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    except json.JSONDecodeError:
        return Response(
            {'error': 'Invalid JSON data'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST','GET'])
@permission_classes([AllowAny])
def logout(request):
    """
    Logout user - JWT tokens are stateless, so we just return success
    The frontend should clear the tokens from storage
    """
    return Response({
        'message': 'Logged out successfully'
    }, status=status.HTTP_200_OK)
