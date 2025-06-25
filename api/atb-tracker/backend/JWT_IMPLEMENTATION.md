# JWT Authentication and User Data Isolation Implementation

This document explains the implementation of JWT (JSON Web Token) authentication and user data isolation in the ATB Tracker application.

## Overview

The implementation ensures that:
1. Each user can only access their own data
2. All API endpoints require JWT authentication
3. User data is completely isolated between different users
4. JWT tokens are used for secure authentication

## Key Components

### 1. JWT Settings (`settings.py`)

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    # ... other JWT settings
}
```

### 2. User Data Isolation Mixin (`users/authentication.py`)

The `UserDataIsolationMixin` ensures that:
- All querysets are filtered by the current user
- New objects are automatically assigned to the current user
- Users can only access their own data

```python
class UserDataIsolationMixin:
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            if hasattr(queryset.model, 'user'):
                return queryset.filter(user=self.request.user)
        return queryset.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

### 3. Updated Models

All models now include a `user` field to track ownership:

- **Project**: `user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='projects')`
- **Task**: `user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='tasks')`
- **TimeEntry**: `user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='time_entries')`
- **Client**: `user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='clients')`
- **Tag**: `user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='tags')`
- **PomodoroSession**: `user = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='pomodoro_sessions')`

### 4. JWT Utilities (`users/utils.py`)

Helper functions for JWT token management:

```python
def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def get_user_from_token(token):
    """Extract user from JWT token"""
    # Implementation details...

def validate_token(token):
    """Validate JWT token"""
    # Implementation details...
```

## API Endpoints

### Authentication Endpoints

1. **User Registration**: `POST /api/users/members/`
   - Creates a new user and returns JWT tokens
   - No authentication required

2. **User Login**: `POST /api/users/login/`
   - Authenticates user and returns JWT tokens
   - No authentication required

3. **Token Refresh**: `POST /api/token/refresh/`
   - Refreshes expired access tokens
   - Requires refresh token

4. **User Profile**: `GET/PUT /api/users/profile/`
   - Get/update current user profile
   - Requires authentication

### Protected Endpoints

All other endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <access_token>
```

## Usage Examples

### 1. User Registration

```bash
curl -X POST http://localhost:8000/api/users/members/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "notification": "Member added successfully!",
  "member": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 2. User Login

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 3. Creating a Project (Authenticated)

```bash
curl -X POST http://localhost:8000/api/projects/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "My Project",
    "status": "Planning",
    "progress": 0
  }'
```

### 4. Getting User's Projects (Authenticated)

```bash
curl -X GET http://localhost:8000/api/projects/projects/ \
  -H "Authorization: Bearer <access_token>"
```

## Data Isolation Verification

The system ensures complete data isolation:

1. **User A** creates projects → Only User A can see them
2. **User B** creates projects → Only User B can see them
3. **User A** cannot access User B's data and vice versa
4. All API responses are filtered by the authenticated user

## Security Features

1. **JWT Token Expiration**: Access tokens expire after 24 hours
2. **Token Refresh**: Refresh tokens valid for 7 days
3. **Token Rotation**: Refresh tokens are rotated on use
4. **User Data Isolation**: Complete separation of user data
5. **Authentication Required**: All sensitive endpoints require authentication

## Testing

Run the test script to verify the implementation:

```bash
cd atb-tracker/backend
python test_jwt_auth.py
```

This will test:
- User registration with JWT tokens
- User login functionality
- Data isolation between users
- Authentication requirements

## Migration Notes

The implementation includes database migrations that:
1. Add user ownership fields to all models
2. Assign existing data to a default user
3. Make user fields required (non-nullable)

## Frontend Integration

To integrate with the frontend:

1. Store JWT tokens securely (localStorage, sessionStorage, or secure cookies)
2. Include the access token in all API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${accessToken}`,
     'Content-Type': 'application/json'
   }
   ```
3. Handle token refresh when access tokens expire
4. Redirect to login when authentication fails

## Dependencies

- `djangorestframework-simplejwt==5.3.0`
- `PyJWT==2.8.0`
- `djangorestframework==3.14.0`
- `django-cors-headers==4.3.1`

## Conclusion

This implementation provides:
- ✅ Complete user data isolation
- ✅ Secure JWT-based authentication
- ✅ Automatic user assignment for new data
- ✅ Protection against unauthorized access
- ✅ Scalable and maintainable architecture

Each user's data is completely isolated, and the system ensures that users can only access their own projects, tasks, time entries, and other data. 