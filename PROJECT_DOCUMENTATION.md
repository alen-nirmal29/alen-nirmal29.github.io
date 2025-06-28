# ATB Tracker - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Authentication System](#authentication-system)
8. [Development Setup](#development-setup)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**ATB Tracker** is a comprehensive productivity management system built with Django (backend) and Next.js (frontend). The application provides time tracking, project management, team collaboration, and productivity analytics features.

### Key Features
- **User Authentication**: JWT-based authentication with email/password and Google OAuth
- **Project Management**: Create, edit, and manage projects with client information
- **Time Tracking**: Track time entries and manage billable hours
- **Pomodoro Timer**: Integrated pomodoro technique for productivity
- **Task Management**: Create and manage tasks within projects
- **Reporting**: Generate productivity and time reports
- **User Settings**: Profile management and preferences

---

## Architecture

### High-Level Architecture
```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    ORM    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │   Backend       │ ◄────────► │   Database      │
│   (Next.js)     │                  │   (Django)      │            │   (SQLite/PostgreSQL) │
└─────────────────┘                  └─────────────────┘            └─────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: Django 5.2.3
- **API**: Django REST Framework
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (development) / PostgreSQL (production)
- **CORS**: django-cors-headers
- **File Storage**: Local media storage

#### Frontend
- **Framework**: Next.js 15.3.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context
- **HTTP Client**: Axios/Fetch API

---

## Backend Documentation

### Project Structure
```
api/atb-tracker/backend/
├── atb_tracker/          # Main Django project
│   ├── settings.py       # Django settings
│   ├── urls.py          # Main URL configuration
│   └── wsgi.py          # WSGI configuration
├── users/               # User management app
├── projects/            # Project management app
├── pomodoro/            # Pomodoro timer app
├── user_settings/       # User preferences app
├── auth_app/            # Authentication app
├── api/                 # General API endpoints
└── manage.py            # Django management script
```

### Django Apps

#### 1. Users App (`users/`)
**Purpose**: User management and authentication

**Models**:
- `Member`: Custom user model extending AbstractUser
  - Uses email as username
  - Supports Firebase UID for OAuth
  - Includes rate, cost, work hours, access rights

**Key Features**:
- Custom user manager
- JWT authentication
- User profile management

#### 2. Projects App (`projects/`)
**Purpose**: Project, client, task, and time entry management

**Models**:
- `Project`: Main project entity
- `Client`: Client information
- `Task`: Tasks within projects
- `TimeEntry`: Time tracking entries
- `Tag`: Project categorization

**Key Features**:
- CRUD operations for all entities
- User data isolation
- Progress tracking
- Billable hours management

#### 3. Pomodoro App (`pomodoro/`)
**Purpose**: Pomodoro technique timer management

**Models**:
- `PomodoroSession`: Pomodoro session records

**Key Features**:
- Session tracking
- Duration calculation
- Break management

#### 4. User Settings App (`user_settings/`)
**Purpose**: User profile and preferences management

**Key Features**:
- Profile photo uploads
- User preferences
- Settings management

### Django Settings Configuration

#### Key Settings
```python
# Authentication
AUTH_USER_MODEL = 'users.Member'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'users.authentication.CustomJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://alen-nirmal29-github-io.vercel.app"
]
CORS_ALLOW_CREDENTIALS = True
```

---

## Frontend Documentation

### Project Structure
```
frontend/
├── app/                 # Next.js app directory
│   ├── dashboard/       # Dashboard page
│   ├── projects/        # Projects page
│   ├── login/           # Login page
│   ├── signup/          # Signup page
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── ui/              # UI components (Radix UI)
│   ├── auth/            # Authentication components
│   └── [feature]/       # Feature-specific components
├── lib/                 # Utility libraries
├── utils/               # API utilities
├── hooks/               # Custom React hooks
└── types.ts             # TypeScript type definitions
```

### Key Components

#### 1. Authentication Components
- `auth-context.tsx`: Global authentication state management
- `login-modal.tsx`: Login modal component
- `protected-route.tsx`: Route protection wrapper

#### 2. Feature Components
- `projects-page.tsx`: Project management interface
- `pomodoro-timer.tsx`: Pomodoro timer component
- `timesheet-view.tsx`: Time tracking interface
- `reports-page.tsx`: Reporting interface

#### 3. UI Components
- Built with Radix UI primitives
- Styled with Tailwind CSS
- Includes: buttons, modals, forms, tables, etc.

### State Management
- **Authentication State**: React Context (`AuthContext`)
- **Local Storage**: JWT tokens and user data
- **Component State**: React hooks for local state

---

## API Documentation

### Base URL
```
Production: https://your-backend-domain.com/api/
Development: http://localhost:8000/api/
```

### Authentication Endpoints

#### Login
```http
POST /api/users/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### Register
```http
POST /api/users/members/
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Token Refresh
```http
POST /api/users/token/refresh/
Content-Type: application/json

{
  "refresh": "refresh_token_here"
}
```

### Project Endpoints

#### List Projects
```http
GET /api/projects/
Authorization: Bearer <access_token>

Response:
[
  {
    "id": 1,
    "name": "Project Name",
    "client": 1,
    "status": "Planning",
    "progress": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Project
```http
POST /api/projects/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "New Project",
  "client": 1,
  "status": "Planning",
  "progress": 0
}
```

#### Update Project
```http
PATCH /api/projects/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "In Progress",
  "progress": 50
}
```

#### Delete Project
```http
DELETE /api/projects/{id}/
Authorization: Bearer <access_token>
```

### Task Endpoints

#### List Tasks
```http
GET /api/projects/tasks/
Authorization: Bearer <access_token>
```

#### Create Task
```http
POST /api/projects/tasks/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Task Title",
  "project": 1,
  "status": "Pending",
  "assigned_to": "John Doe"
}
```

#### Update Task
```http
PATCH /api/projects/tasks/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "Completed"
}
```

### Pomodoro Endpoints

#### List Pomodoro Sessions
```http
GET /api/pomodoros/
Authorization: Bearer <access_token>
```

#### Create Pomodoro Session
```http
POST /api/pomodoros/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "start_time": "2024-01-01T10:00:00Z",
  "end_time": "2024-01-01T10:25:00Z",
  "duration": 1500,
  "break_duration": 300,
  "cycles": 1,
  "notes": "Work session notes"
}
```

### User Settings Endpoints

#### Get User Profile
```http
GET /api/user-settings/profile/
Authorization: Bearer <access_token>
```

#### Update User Profile
```http
PUT /api/user-settings/profile/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "first_name": "John",
  "last_name": "Doe",
  "picture": <file>
}
```

---

## Database Schema

### Users App
```sql
-- Custom User Model
CREATE TABLE users_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    is_superuser BOOLEAN NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    is_staff BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    date_joined DATETIME NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    firebase_uid VARCHAR(128) UNIQUE NULL,
    picture VARCHAR(500) NULL,
    provider VARCHAR(50) DEFAULT 'email',
    email_verified BOOLEAN DEFAULT FALSE,
    rate DECIMAL(10,2) NULL,
    cost DECIMAL(10,2) NULL,
    work_hours VARCHAR(255) NULL,
    access_rights VARCHAR(100) NULL,
    groups VARCHAR(255) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

### Projects App
```sql
-- Tags
CREATE TABLE projects_tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NULL,
    description TEXT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE(name, user_id),
    FOREIGN KEY (user_id) REFERENCES users_member(id)
);

-- Clients
CREATE TABLE projects_client (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL,
    email VARCHAR(254) NULL,
    address TEXT NULL,
    note TEXT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    UNIQUE(name, user_id),
    FOREIGN KEY (user_id) REFERENCES users_member(id)
);

-- Projects
CREATE TABLE projects_project (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    client_id INTEGER NULL,
    status VARCHAR(50) DEFAULT 'Planning',
    progress INTEGER DEFAULT 0,
    user_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (client_id) REFERENCES projects_client(id),
    FOREIGN KEY (user_id) REFERENCES users_member(id)
);

-- Tasks
CREATE TABLE projects_task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    project_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    assigned_to VARCHAR(255) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects_project(id),
    FOREIGN KEY (user_id) REFERENCES users_member(id)
);

-- Time Entries
CREATE TABLE projects_timeentry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    date DATE NOT NULL,
    billable BOOLEAN DEFAULT FALSE,
    type VARCHAR(10) DEFAULT 'regular',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects_project(id),
    FOREIGN KEY (user_id) REFERENCES users_member(id)
);
```

### Pomodoro App
```sql
-- Pomodoro Sessions
CREATE TABLE pomodoro_pomodorosession (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration INTEGER NOT NULL,
    break_duration INTEGER NOT NULL,
    cycles INTEGER NOT NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users_member(id)
);
```

---

## Authentication System

### JWT Authentication Flow

1. **Login Process**:
   - User submits credentials
   - Backend validates credentials
   - Returns access and refresh tokens
   - Frontend stores tokens in localStorage

2. **Token Management**:
   - Access token: 24 hours validity
   - Refresh token: 7 days validity
   - Automatic token refresh on expiration

3. **Request Authentication**:
   - All API requests include `Authorization: Bearer <token>` header
   - Backend validates token and identifies user

4. **Token Refresh**:
   - When access token expires, frontend uses refresh token
   - Backend issues new access token
   - If refresh fails, user is logged out

### Security Features
- **CORS Protection**: Configured for specific origins
- **Token Blacklisting**: Expired tokens are blacklisted
- **User Data Isolation**: Users can only access their own data
- **Password Validation**: Django's built-in password validators

---

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or pnpm
- Git

### Backend Setup

1. **Clone and Navigate**:
```bash
cd api/atb-tracker/backend
```

2. **Create Virtual Environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

4. **Environment Variables**:
Create `.env` file:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

5. **Database Setup**:
```bash
python manage.py migrate
python manage.py createsuperuser
```

6. **Run Development Server**:
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to Frontend**:
```bash
cd frontend
```

2. **Install Dependencies**:
```bash
npm install
# or
pnpm install
```

3. **Environment Variables**:
Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

4. **Run Development Server**:
```bash
npm run dev
# or
pnpm dev
```

### Database Reset (if needed)
```bash
cd api/atb-tracker/backend
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

## Deployment

### Backend Deployment (Django)

1. **Production Settings**:
   - Set `DEBUG=False`
   - Configure production database
   - Set proper `SECRET_KEY`
   - Configure `ALLOWED_HOSTS`

2. **Static Files**:
```bash
python manage.py collectstatic
```

3. **Database Migration**:
```bash
python manage.py migrate
```

4. **WSGI Server**:
   - Use Gunicorn or uWSGI
   - Configure with Nginx

### Frontend Deployment (Next.js)

1. **Build Application**:
```bash
npm run build
```

2. **Start Production Server**:
```bash
npm start
```

3. **Vercel Deployment**:
   - Connect GitHub repository
   - Configure environment variables
   - Deploy automatically

### Environment Variables for Production

#### Backend
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:password@host:port/dbname
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

#### Frontend
```env
NEXT_PUBLIC_API_BASE=https://your-backend-domain.com/api
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't access backend API
**Solution**: 
- Check `CORS_ALLOWED_ORIGINS` in Django settings
- Ensure frontend URL is included
- Verify `CORS_ALLOW_CREDENTIALS=True`

#### 2. Authentication Issues
**Problem**: JWT tokens not working
**Solution**:
- Clear localStorage in browser
- Check token expiration
- Verify `Authorization` header format
- Check backend JWT settings

#### 3. Database Errors
**Problem**: Model-related errors
**Solution**:
- Reset database with migration commands
- Check model field changes
- Verify foreign key relationships

#### 4. File Upload Issues
**Problem**: Profile photos not uploading
**Solution**:
- Check media directory permissions
- Verify `MEDIA_URL` and `MEDIA_ROOT` settings
- Ensure proper file size limits

#### 5. React Rendering Errors
**Problem**: Objects being rendered in JSX
**Solution**:
- Add proper validation before rendering
- Use optional chaining (`?.`)
- Implement fallback values

### Debug Mode

#### Backend Debugging
- Check Django server logs
- Use Django Debug Toolbar
- Enable detailed error messages

#### Frontend Debugging
- Check browser console
- Use React Developer Tools
- Monitor network requests

### Performance Optimization

#### Backend
- Use database indexing
- Implement caching
- Optimize database queries
- Use pagination for large datasets

#### Frontend
- Implement code splitting
- Use React.memo for components
- Optimize bundle size
- Implement lazy loading

---

## API Testing

### Using curl

#### Login Test
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### Create Project Test
```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"name": "Test Project", "status": "Planning"}'
```

### Using Python Scripts
See `test_api.py` and `test_client_api.py` for examples.

---

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow PEP 8 for Python
- Use TypeScript for frontend
- Add proper documentation
- Include error handling
- Write tests for new features

---

## License

This project is licensed under the MIT License.

---

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check GitHub issues
4. Contact the development team

---

*Last Updated: January 2024*
*Version: 1.0.0* 