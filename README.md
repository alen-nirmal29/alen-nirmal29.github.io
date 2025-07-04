# ATB Tracker - Productivity Management System

A comprehensive productivity management system with time tracking, project management, and team collaboration features.

## Current Status ✅

The application is now fully functional with all major issues resolved:

- ✅ Authentication system working properly
- ✅ Backend API endpoints responding correctly
- ✅ Profile management and photo uploads working
- ✅ Project management with proper data validation
- ✅ React rendering issues fixed
- ✅ CORS and security configurations updated

## Features

### Frontend (Next.js + TypeScript)
- **Dashboard**: Overview with time tracking, projects, and productivity metrics
- **Projects**: Create, edit, and manage projects with team collaboration
- **Time Tracking**: Track time entries and manage billable hours
- **Reports**: Generate productivity and time reports
- **Settings**: User profile management and preferences
- **Authentication**: Login/register with Google OAuth support

### Backend (Django + Django REST Framework)
- **User Management**: Custom user model with profiles
- **Project Management**: CRUD operations for projects
- **Time Tracking**: Time entries and pomodoro sessions
- **JWT Authentication**: Secure token-based authentication
- **File Uploads**: Profile photo and avatar management

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- PostgreSQL (optional, SQLite used by default)

### Backend Setup
```bash
cd atb-tracker
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Reset (if needed)
If you encounter model-related issues:
```bash
cd atb-tracker
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## Environment Variables

### Backend (.env in atb-tracker/)
```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local in frontend/)
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/verify/` - Token verification

### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `PUT /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project

### User Settings
- `GET /api/user-settings/profile/` - Get user profile
- `PUT /api/user-settings/profile/` - Update user profile

## Recent Fixes Applied

1. **Authentication Flow**: Fixed redirect issues and state management
2. **Backend API**: Resolved CORS and allowed hosts configuration
3. **Profile Management**: Fixed serializer validation and file uploads
4. **React Rendering**: Added comprehensive validation to prevent object rendering errors
5. **Status Icons**: Fixed React component rendering with proper createElement usage

## Development Notes

- The application uses JWT tokens for authentication
- File uploads are handled with proper media settings
- All React components include comprehensive error handling
- Backend includes proper validation and error responses
- Frontend includes fallback data and loading states

## Troubleshooting

### Common Issues
1. **Database errors**: Reset database with migration commands above
2. **CORS errors**: Ensure backend CORS settings match frontend URL
3. **Authentication issues**: Clear localStorage and restart both servers
4. **File upload issues**: Check media directory permissions

### Debug Mode
Both frontend and backend include comprehensive logging for debugging:
- Frontend: Check browser console for detailed logs
- Backend: Check Django server output for API logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.