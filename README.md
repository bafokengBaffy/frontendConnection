I'll generate all the production-ready documentation files for your Career Connect Lesotho frontend application.

## `/docs/README.md`
```markdown
# Career Connect Lesotho Documentation

Welcome to the official documentation for Career Connect Lesotho, a comprehensive digital platform bridging youth, educational institutions, and employers in Lesotho.

## 📚 Documentation Structure

| Document | Description |
|----------|-------------|
| [API.md](API.md) | API integration guidelines and endpoints |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design patterns |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment procedures and environments |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Development setup and workflow |
| [TESTING.md](TESTING.md) | Testing strategies and practices |
| [SECURITY.md](SECURITY.md) | Security measures and best practices |
| [PERFORMANCE.md](PERFORMANCE.md) | Performance optimization guidelines |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | Accessibility standards and implementation |
| [LOCALIZATION.md](LOCALIZATION.md) | Internationalization and localization |
| [MONITORING.md](MONITORING.md) | Monitoring and observability |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [FAQ.md](FAQ.md) | Frequently asked questions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [CHANGELOG.md](CHANGELOG.md) | Version history and changes |
| [ROADMAP.md](ROADMAP.md) | Future development plans |

## 🎯 Quick Links

- **Live Application:** [https://career-connect-lesotho.web.app](https://career-connect-lesotho.web.app)
- **Staging Environment:** [https://staging.career-connect-lesotho.web.app](https://staging.career-connect-lesotho.web.app)
- **API Documentation:** [https://api.careerconnect.co.ls/docs](https://api.careerconnect.co.ls/docs)
- **GitHub Repository:** [https://github.com/yourusername/career-connect-lesotho](https://github.com/yourusername/career-connect-lesotho)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher / yarn 1.22.x
- Firebase account
- Git

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/career-connect-lesotho.git
cd career-connect-lesotho/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## 📖 Additional Resources

- [Project Wiki](https://github.com/yourusername/career-connect-lesotho/wiki)
- [API Reference](https://api.careerconnect.co.ls/reference)
- [Style Guide](https://career-connect-lesotho.styleguide.com)
- [Component Library](https://career-connect-lesotho.storybook.com)

## 🤝 Support

- **Documentation Issues:** [GitHub Issues](https://github.com/yourusername/career-connect-lesotho/issues)
- **Community Support:** [GitHub Discussions](https://github.com/yourusername/career-connect-lesotho/discussions)
- **Email:** support@careerconnect.co.ls
- **Slack:** [Career Connect Workspace](https://career-connect.slack.com)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Last Updated:** March 2026  
**Version:** 2.0.0
```

## `/docs/API.md`
```markdown
# API Integration Guide

## Overview

Career Connect Lesotho uses a combination of Firebase services and custom REST APIs. This document outlines how to interact with these APIs from the frontend.

## Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5000/api` |
| Staging | `https://api-staging.careerconnect.co.ls/api` |
| Production | `https://api.careerconnect.co.ls/api` |

## Authentication

### Firebase Authentication

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();
```

### API Authentication

Include the Firebase token in all API requests:

```javascript
const response = await fetch(`${API_BASE_URL}/jobs`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## API Clients

### Axios Configuration

```javascript
// src/services/api.js
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Endpoints

### Authentication

#### `POST /auth/login`
Authenticate user with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "student",
    "profile": {}
  },
  "token": "firebase-jwt-token"
}
```

#### `POST /auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "student"
  },
  "token": "firebase-jwt-token"
}
```

### Jobs

#### `GET /jobs`
Get paginated list of jobs.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `category` (string): Filter by category
- `location` (string): Filter by location
- `type` (string): Filter by job type

**Response:**
```json
{
  "data": [
    {
      "id": "job-123",
      "title": "Frontend Developer",
      "company": {
        "id": "company-456",
        "name": "Tech Solutions"
      },
      "location": "Maseru",
      "type": "Full-time",
      "salary": {
        "min": 15000,
        "max": 25000,
        "currency": "LSL"
      },
      "postedDate": "2024-03-01T00:00:00Z",
      "deadline": "2024-04-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### `GET /jobs/:id`
Get job details by ID.

**Response:**
```json
{
  "id": "job-123",
  "title": "Frontend Developer",
  "description": "We are looking for...",
  "requirements": ["React", "JavaScript"],
  "responsibilities": ["Build UI components"],
  "company": {
    "id": "company-456",
    "name": "Tech Solutions",
    "logo": "https://...",
    "description": "Leading tech company"
  },
  "location": "Maseru",
  "type": "Full-time",
  "salary": {
    "min": 15000,
    "max": 25000,
    "currency": "LSL"
  },
  "benefits": ["Health insurance", "Flexible hours"],
  "postedDate": "2024-03-01T00:00:00Z",
  "deadline": "2024-04-01T00:00:00Z",
  "applications": 23
}
```

#### `POST /jobs/:id/apply`
Apply for a job.

**Request:**
```json
{
  "coverLetter": "I am interested in this position...",
  "resume": "https://storage.url/resume.pdf",
  "additionalDocs": ["doc1.pdf", "doc2.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "applicationId": "app-789",
  "status": "pending"
}
```

### Companies

#### `GET /companies`
Get list of companies.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `industry` (string): Filter by industry
- `search` (string): Search by name

**Response:**
```json
{
  "data": [
    {
      "id": "company-456",
      "name": "Tech Solutions",
      "industry": "Technology",
      "location": "Maseru",
      "logo": "https://...",
      "openPositions": 5,
      "rating": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### `GET /companies/:id`
Get company details.

**Response:**
```json
{
  "id": "company-456",
  "name": "Tech Solutions",
  "description": "Leading technology company...",
  "industry": "Technology",
  "size": "50-100",
  "founded": 2015,
  "location": "Maseru",
  "website": "https://techsolutions.co.ls",
  "logo": "https://...",
  "socialMedia": {
    "linkedin": "https://linkedin.com/company/techsolutions",
    "twitter": "https://twitter.com/techsolutions"
  },
  "openPositions": 5,
  "jobs": [
    {
      "id": "job-123",
      "title": "Frontend Developer",
      "type": "Full-time",
      "deadline": "2024-04-01"
    }
  ],
  "reviews": [
    {
      "rating": 5,
      "comment": "Great place to work",
      "user": "John Doe",
      "date": "2024-02-15"
    }
  ]
}
```

### Users/Profile

#### `GET /profile`
Get current user profile.

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "profile": {
    "phone": "+266 12345678",
    "location": "Maseru",
    "bio": "Computer Science student",
    "avatar": "https://...",
    "skills": ["JavaScript", "React"],
    "education": [
      {
        "institution": "National University of Lesotho",
        "degree": "Bachelor",
        "field": "Computer Science",
        "startYear": 2022,
        "endYear": 2025
      }
    ],
    "experience": [
      {
        "company": "Tech Solutions",
        "position": "Intern",
        "startDate": "2024-01",
        "endDate": "2024-03",
        "description": "Worked on frontend development"
      }
    ]
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-03-01T00:00:00Z"
}
```

#### `PUT /profile`
Update user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "phone": "+266 87654321",
    "location": "Leribe",
    "bio": "Updated bio",
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "profile": { ...updated profile }
}
```

### Applications

#### `GET /applications`
Get user's job applications.

**Query Parameters:**
- `status` (string): Filter by status (pending, reviewed, accepted, rejected)

**Response:**
```json
{
  "data": [
    {
      "id": "app-789",
      "job": {
        "id": "job-123",
        "title": "Frontend Developer",
        "company": "Tech Solutions"
      },
      "status": "pending",
      "appliedDate": "2024-03-01T00:00:00Z",
      "lastUpdated": "2024-03-01T00:00:00Z"
    }
  ]
}
```

### Notifications

#### `GET /notifications`
Get user notifications.

**Response:**
```json
{
  "data": [
    {
      "id": "notif-456",
      "type": "application_update",
      "title": "Application Status Updated",
      "message": "Your application for Frontend Developer has been reviewed",
      "read": false,
      "createdAt": "2024-03-01T00:00:00Z",
      "data": {
        "applicationId": "app-789",
        "jobId": "job-123"
      }
    }
  ],
  "unreadCount": 3
}
```

#### `POST /notifications/:id/read`
Mark notification as read.

**Response:**
```json
{
  "success": true
}
```

### Analytics

#### `GET /analytics/dashboard`
Get dashboard analytics.

**Response:**
```json
{
  "metrics": {
    "profileViews": 1234,
    "applications": 56,
    "jobMatches": 89,
    "profileCompleteness": 75
  },
  "charts": {
    "applicationsOverTime": [
      { "date": "2024-03-01", "count": 5 },
      { "date": "2024-03-02", "count": 8 }
    ],
    "jobsByCategory": [
      { "category": "Technology", "count": 45 },
      { "category": "Business", "count": 30 }
    ]
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 422 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Error Handling Example

```javascript
try {
  const response = await api.get('/jobs');
} catch (error) {
  if (error.response) {
    const { code, message } = error.response.data.error;
    
    switch (code) {
      case 'UNAUTHORIZED':
        // Redirect to login
        break;
      case 'VALIDATION_ERROR':
        // Show validation errors
        break;
      default:
        // Show generic error
        toast.error(message);
    }
  }
}
```

## Rate Limiting

- **Public endpoints:** 100 requests per minute
- **Authenticated endpoints:** 1000 requests per minute
- **Premium endpoints:** 5000 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## WebSocket Events

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
  auth: {
    token: firebaseToken
  }
});
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `notification` | Server → Client | New notification |
| `application_update` | Server → Client | Application status change |
| `chat_message` | Bidirectional | Real-time chat messages |
| `typing` | Client → Server | User typing indicator |
| `job_match` | Server → Client | New job match found |

## Versioning

The API uses versioning in the URL path: `/api/v1/`. The current stable version is v1.

## Best Practices

1. **Always handle errors gracefully**
2. **Implement request retries with exponential backoff**
3. **Cache responses when appropriate**
4. **Use request cancellation for unnecessary requests**
5. **Implement optimistic updates for better UX**
6. **Validate data on both client and server**
7. **Use TypeScript for better type safety**

```javascript
// Example with retries and caching
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};
```

## Support

For API issues or questions:
- **API Status:** [https://status.careerconnect.co.ls](https://status.careerconnect.co.ls)
- **API Support:** api-support@careerconnect.co.ls
- **API Documentation:** [https://api.careerconnect.co.ls/docs](https://api.careerconnect.co.ls/docs)
```

## `/docs/ARCHITECTURE.md`
```markdown
# System Architecture

## Overview

Career Connect Lesotho follows a modern frontend architecture with React, Vite, and Firebase. This document outlines the architectural decisions, patterns, and structure of the application.

## Tech Stack

```
┌─────────────────────────────────────┐
│         React 18 (UI Layer)          │
├─────────────────────────────────────┤
│     State Management (Context)       │
├─────────────────────────────────────┤
│        React Query (Data)            │
├─────────────────────────────────────┤
│      Firebase SDK (Backend)          │
├─────────────────────────────────────┤
│         Vite (Build Tool)            │
└─────────────────────────────────────┘
```

### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.3.1 |
| Vite | Build Tool | 5.4.21 |
| Firebase | Backend Services | 10.14.0 |
| React Query | Data Fetching | 5.52.2 |
| React Router | Routing | 6.26.2 |
| Material UI | Component Library | 7.3.9 |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    React Application                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Components Layer                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│   │
│  │  │   Pages  │ │  Layout  │ │  Common  │ │   Forms  ││   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                  State Management                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│   │
│  │  │ Context  │ │   Hooks  │ │   React  │ │   Local  ││   │
│  │  │          │ │          │ │   Query  │ │  Storage ││   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                    Services Layer                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│   │
│  │  │   API    │ │ Firebase │ │   Auth   │ │  Storage ││   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                    Utils Layer                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│   │
│  │  │ Helpers  │ │Constants │ │Validators│ │Formatters││   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    External Services                          │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │   Firebase     │ │   REST API     │ │   Cloudinary   │   │
│  │   Auth/DB      │ │   Backend      │ │    Storage     │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │   SendGrid     │ │   OpenAI       │ │   Stripe/      │   │
│  │    Email       │ │     API        │ │   Paystack     │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│ Component │ ──────> │   Hook   │ ──────> │ Service  │
└──────────┘          └──────────┘          └──────────┘
     ▲                      │                      │
     │                      │                      │
     │                      ▼                      ▼
┌──────────┐          ┌──────────┐          ┌──────────┐
│   UI     │ <────── │   React  │ <────── │ External │
│ Update   │          │   Query  │          │   API    │
└──────────┘          └──────────┘          └──────────┘
```

## Directory Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common components (Button, Input, etc.)
│   │   ├── layout/          # Layout components (Header, Footer, etc.)
│   │   ├── forms/           # Form components
│   │   ├── ui/              # UI primitives
│   │   └── AI/              # AI-specific components
│   │
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin pages
│   │   ├── student/         # Student pages
│   │   ├── company/         # Company pages
│   │   ├── mentor/          # Mentor pages
│   │   ├── entrepreneur/    # Entrepreneur pages
│   │   └── auth/            # Authentication pages
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication hook
│   │   ├── useFetch.js      # Data fetching hook
│   │   └── useForm.js       # Form handling hook
│   │
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx  # Authentication context
│   │   ├── ThemeContext.jsx # Theme context
│   │   └── NotificationContext.jsx # Notification context
│   │
│   ├── services/            # API and external services
│   │   ├── api.js           # Axios configuration
│   │   ├── firebase.js      # Firebase configuration
│   │   └── cloudinary.js    # Cloudinary service
│   │
│   ├── utils/               # Utility functions
│   │   ├── helpers.js       # General helpers
│   │   ├── validators.js    # Validation functions
│   │   └── formatters.js    # Data formatters
│   │
│   ├── types/                # Type definitions (JS docs)
│   ├── config/               # Configuration files
│   └── routing/              # Routing configuration
│
├── public/                    # Static assets
├── tests/                     # Test files
└── docs/                      # Documentation
```

## Design Patterns

### 1. Component Patterns

#### Atomic Design
```javascript
// Atoms - Basic building blocks
// components/ui/Button.jsx
// components/ui/Input.jsx

// Molecules - Combinations of atoms
// components/forms/SearchBar.jsx
// components/forms/LoginForm.jsx

// Organisms - Complex UI sections
// components/layout/Header.jsx
// components/layout/Sidebar.jsx

// Templates - Page layouts
// pages/student/StudentDashboard.jsx

// Pages - Complete pages
// pages/Home.jsx
```

#### Compound Components
```javascript
// components/common/Select.jsx
const Select = ({ children }) => { ... };
Select.Option = ({ value, children }) => { ... };

// Usage
<Select>
  <Select.Option value="1">Option 1</Select.Option>
  <Select.Option value="2">Option 2</Select.Option>
</Select>
```

#### Render Props
```javascript
// components/common/DataFetcher.jsx
const DataFetcher = ({ url, children }) => {
  const { data, loading } = useFetch(url);
  return children({ data, loading });
};

// Usage
<DataFetcher url="/api/jobs">
  {({ data, loading }) => (
    loading ? <Spinner /> : <JobList jobs={data} />
  )}
</DataFetcher>
```

### 2. State Management

#### Context for Global State
```javascript
// context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setUser(user);
  };
  
  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### React Query for Server State
```javascript
// hooks/useJobs.js
export const useJobs = (filters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.get('/jobs', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

#### Local State with Hooks
```javascript
// components/forms/JobSearch.jsx
const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data } = useJobs({ search: debouncedSearch, ...filters });
  
  return ( ... );
};
```

### 3. Service Layer Pattern

```javascript
// services/jobService.js
class JobService {
  async getJobs(filters) {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  }
  
  async getJobById(id) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  }
  
  async applyForJob(jobId, application) {
    const response = await api.post(`/jobs/${jobId}/apply`, application);
    return response.data;
  }
}

export const jobService = new JobService();
```

### 4. Custom Hooks Pattern

```javascript
// hooks/useJobApplication.js
export const useJobApplication = (jobId) => {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState(null);
  
  const apply = async (applicationData) => {
    setIsApplying(true);
    try {
      const result = await jobService.applyForJob(jobId, applicationData);
      toast.success('Application submitted successfully!');
      return result;
    } catch (err) {
      setError(err);
      toast.error('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };
  
  return { apply, isApplying, error };
};
```

## Performance Optimizations

### 1. Code Splitting

```javascript
// routing/index.jsx
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const CompanyDashboard = lazy(() => import('../pages/company/CompanyDashboard'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/student/*" element={<StudentDashboard />} />
      <Route path="/company/*" element={<CompanyDashboard />} />
    </Routes>
  </Suspense>
);
```

### 2. Memoization

```javascript
// components/common/JobCard.jsx
const JobCard = memo(({ job, onApply }) => {
  return (
    <Card>
      <h3>{job.title}</h3>
      <button onClick={() => onApply(job.id)}>Apply</button>
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.job.id === nextProps.job.id;
});
```

### 3. Virtual Lists

```javascript
// pages/student/JobList.jsx
import { FixedSizeList as List } from 'react-window';

const JobList = ({ jobs }) => (
  <List
    height={600}
    itemCount={jobs.length}
    itemSize={100}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <JobCard job={jobs[index]} />
      </div>
    )}
  </List>
);
```

## Security Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────>│ Firebase │────>│   JWT    │
│  Form    │     │   Auth   │     │   Token  │
└──────────┘     └──────────┘     └──────────┘
                                     │
                                     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  API     │<────│  Token   │<────│  Token   │
│ Request  │     │  Header  │     │ Storage  │
└──────────┘     └──────────┘     └──────────┘
```

### Authorization

```javascript
// components/layout/ProtectedRoute.jsx
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, hasRole } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

## Error Handling

### Global Error Boundary

```javascript
// components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    logger.error('Component Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```javascript
// services/api.js
api.interceptors.response.use(
  response => response,
  error => {
    const errorMap = {
      401: () => navigate('/login'),
      403: () => navigate('/unauthorized'),
      404: () => navigate('/404'),
      500: () => toast.error('Server error'),
    };
    
    const handler = errorMap[error.response?.status];
    if (handler) handler();
    
    return Promise.reject(error);
  }
);
```

## Testing Architecture

```
┌─────────────────────────────────────┐
│         Testing Pyramid              │
│                                     │
│        ┌─────────────┐              │
│   E2E  │   Cypress   │   Few        │
│        │  Playwright │              │
│        └─────────────┘              │
│                                     │
│        ┌─────────────┐              │
│Integra-│   Vitest    │   Some       │
│  tion  │   MSW       │              │
│        └─────────────┘              │
│                                     │
│        ┌─────────────┐              │
│  Unit  │   Vitest    │   Many       │
│        │  RTL        │              │
│        └─────────────┘              │
└─────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         GitHub Repository            │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│        GitHub Actions (CI/CD)        │
│  ┌──────────┐  ┌──────────┐        │
│  │   Lint   │  │   Test   │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │  Build   │  │  Deploy  │        │
│  └──────────┘  └──────────┘        │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                    ▼
┌───────────────┐    ┌───────────────┐
│   Firebase    │    │   Firebase    │
│   Staging     │    │  Production   │
└───────────────┘    └───────────────┘
```

## Monitoring Architecture

```
┌─────────────────────────────────────┐
│         Application                  │
└─────────┬───────────┬───────────────┘
          │           │
          ▼           ▼
┌─────────────────────────────────────┐
│         Monitoring Stack             │
│  ┌──────────┐  ┌──────────┐        │
│  │ Sentry   │  │ Google   │        │
│  │ Errors   │  │Analytics │        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │ LogRocket│  │  Custom  │        │
│  │ Sessions │  │ Metrics  │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

## Scalability Considerations

1. **Horizontal Scaling**: Firebase automatically scales
2. **Code Splitting**: Lazy loading for routes
3. **Caching**: React Query for server state
4. **CDN**: Static assets served via CDN
5. **Database Indexing**: Firestore indexes for queries
6. **Rate Limiting**: API rate limiting
7. **Pagination**: All list endpoints paginated

## Best Practices

### Code Organization
- Feature-based folder structure
- Shared components in `common/`
- Custom hooks in `hooks/`
- Services in `services/`

### State Management
- React Query for server state
- Context for global UI state
- Local state for component state
- URL for route state

### Performance
- Lazy loading for routes
- Image optimization
- Bundle optimization
- Virtual scrolling for long lists

### Security
- JWT tokens with short expiry
- HTTPS only
- Input validation
- XSS prevention
- CSRF protection

## Migration Strategy

### To TypeScript
1. Rename `.jsx` to `.tsx` incrementally
2. Add type definitions
3. Configure `tsconfig.json`
4. Run type checking in CI

### To Next.js (Future)
1. Incremental adoption
2. API routes for backend
3. SSR for critical pages
4. Static generation for content

---

**Last Updated:** March 2026  
**Version:** 2.0.0
```

## `/docs/DEPLOYMENT.md`
```markdown
# Deployment Guide

## Overview

This document outlines the deployment process for Career Connect Lesotho frontend application across different environments.

## Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | `http://localhost:3000` | Local development |
| Staging | `https://staging.career-connect-lesotho.web.app` | Testing and QA |
| Production | `https://career-connect-lesotho.web.app` | Live application |

## Prerequisites

### Required Accounts
- [Firebase Console](https://console.firebase.google.com/)
- [GitHub Account](https://github.com) (for CI/CD)
- [Cloudinary Account](https://cloudinary.com) (for media)
- [SendGrid Account](https://sendgrid.com) (for emails)

### Required Tools
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Vercel CLI (optional)
npm install -g vercel

# Install Netlify CLI (optional)
npm install -g netlify-cli
```

### Environment Variables

Create environment files for each deployment:

**`.env.production`**
```env
VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=career-connect-lesotho.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=career-connect-lesotho
VITE_FIREBASE_STORAGE_BUCKET=career-connect-lesotho.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_APP_ENVIRONMENT=production
VITE_APP_BASE_URL=https://career-connect-lesotho.web.app
VITE_API_BASE_URL=https://api.careerconnect.co.ls/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Deployment Methods

### Method 1: Manual Deployment

#### Build the Application
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm ci --legacy-peer-deps

# Build for production
npm run build:prod

# The build output will be in the 'dist' folder
```

#### Deploy to Firebase
```bash
# Login to Firebase
firebase login

# Initialize Firebase (first time only)
firebase init

# Select hosting and your project

# Deploy to production
firebase deploy --only hosting

# Deploy to specific project
firebase use career-connect-lesotho-staging
firebase deploy --only hosting
```

#### Deploy to Netlify
```bash
# Build the project
npm run build:prod

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Or drag and drop the 'dist' folder to Netlify Drop
```

#### Deploy to Vercel
```bash
# Deploy to Vercel
vercel --prod

# Or with configuration
vercel --prod --env VITE_APP_ENVIRONMENT=production
```

### Method 2: CI/CD Deployment (Recommended)

#### GitHub Actions

The repository includes GitHub Actions workflows for automated deployment:

**`.github/workflows/deploy.yml`**
```yaml
name: Deploy

on:
  push:
    branches: [main, staging]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci --legacy-peer-deps
      
      - name: Build
        run: |
          cd frontend
          npm run build:${{ github.event.inputs.environment }}
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # ... other env vars
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: career-connect-lesotho-${{ github.event.inputs.environment }}
```

#### Setting up GitHub Secrets

Add these secrets in your GitHub repository:
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset
- `SLACK_WEBHOOK_URL` - Slack notifications (optional)

### Method 3: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend/ ./
RUN npm run build:prod

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_APP_ENVIRONMENT=production
    restart: always
```

#### Build and Run
```bash
# Build Docker image
docker build -t career-connect-frontend -f frontend/Dockerfile .

# Run container
docker run -p 80:80 career-connect-frontend

# Or with docker-compose
docker-compose up -d
```

## Deployment Checklist

### Pre-deployment

- [ ] All tests pass (`npm run test:ci`)
- [ ] Linting passes (`npm run lint`)
- [ ] Formatting is correct (`npm run format:check`)
- [ ] Build succeeds locally (`npm run build:prod`)
- [ ] Environment variables are set correctly
- [ ] Firebase project is selected correctly
- [ ] Database indexes are created
- [ ] Security rules are updated
- [ ] Backend APIs are accessible

### Post-deployment

- [ ] Application loads successfully
- [ ] Authentication works
- [ ] API calls succeed
- [ ] Images load from Cloudinary
- [ ] Environment variables are correct
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] PWA installable
- [ ] Offline mode works

## Environment Configuration

### Firebase Projects

Create separate Firebase projects for each environment:

1. **Development**: `career-connect-lesotho-dev`
2. **Staging**: `career-connect-lesotho-staging`
3. **Production**: `career-connect-lesotho`

### Firebase Hosting Configuration

**`firebase.json`**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400"
          }
        ]
      }
    ]
  }
}
```

## Rollback Procedures

### Firebase Rollback

```bash
# List deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:clone <previous-version> live

# Or use Firebase Console to rollback
```

### GitHub Actions Rollback

```yaml
# Manual rollback workflow
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.version }}
      
      - name: Deploy previous version
        # ... deployment steps
```

## Monitoring Post-Deployment

### Check Application Health
```bash
# Check if site is up
curl -I https://career-connect-lesotho.web.app

# Check API health
curl https://api.careerconnect.co.ls/health

# Check SSL certificate
openssl s_client -connect career-connect-lesotho.web.app:443
```

### Monitor Key Metrics

1. **Page Load Time** - Should be < 3s
2. **Time to Interactive** - Should be < 5s
3. **Error Rate** - Should be < 1%
4. **API Response Time** - Should be < 500ms
5. **User Sessions** - Monitor active users

### Alerting

Set up alerts for:
- High error rates (> 5%)
- Slow response times (> 2s)
- Low traffic (potential outage)
- SSL certificate expiry
- Firebase quota limits

## Performance Optimization

### Before Deployment
```bash
# Analyze bundle size
npm run analyze

# Check performance
npm run test:performance

# Run Lighthouse locally
npx lhci autorun
```

### CDN Configuration

```javascript
// vite.config.mjs
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@emotion/react'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
};
```

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be >= 18
```

#### Deployment Fails
```bash
# Check Firebase login
firebase login --reauth

# Check project
firebase projects:list

# Set correct project
firebase use career-connect-lesotho
```

#### Application Not Loading
```bash
# Check console for errors
# Check if index.html is served
curl https://career-connect-lesotho.web.app

# Check if assets load
curl https://career-connect-lesotho.web.app/assets/index-abc123.js
```

## Security Checks

### Pre-deployment Security
```bash
# Run security audit
npm run security

# Check for vulnerabilities
npm audit --audit-level=high

# Run dependency check
npx snyk test
```

### Post-deployment Security
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No sensitive data exposed
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Authentication working
- [ ] Authorization enforced

## Release Process

### Versioning

Follow semantic versioning:
- **Major**: Breaking changes (v2.0.0)
- **Minor**: New features (v2.1.0)
- **Patch**: Bug fixes (v2.1.1)

### Release Steps

1. **Create Release Branch**
```bash
git checkout -b release/v2.0.0 develop
```

2. **Update Version**
```bash
npm version 2.0.0
```

3. **Update Changelog**
```bash
npm run changelog
```

4. **Create Pull Request**
- Target: `main` branch
- Title: "Release v2.0.0"

5. **Deploy to Staging**
- Test thoroughly
- Run E2E tests
- Get QA approval

6. **Deploy to Production**
- Merge PR to `main`
- GitHub Actions auto-deploys
- Monitor for issues

7. **Tag Release**
```bash
git tag -a v2.0.0 -m "Release version 2.0.0"
git push origin v2.0.0
```

## Environment-Specific Configuration

### Development
```javascript
// vite.config.mjs
export default {
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
};
```

### Staging
```javascript
// vite.config.mjs
export default {
  build: {
    sourcemap: true, // Enable for debugging
    minify: true
  }
};
```

### Production
```javascript
// vite.config.mjs
export default {
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
};
```

## Quick Reference

### Deployment Commands
```bash
# Deploy to production
npm run deploy:prod

# Deploy to staging
npm run deploy:staging

# Deploy to development
npm run deploy:dev

# Preview production build locally
npm run preview:prod
```

### Environment Variables
```bash
# Check current environment variables
echo $VITE_APP_ENVIRONMENT

# Set environment variable
export VITE_APP_ENVIRONMENT=production
```

### Useful Links
- **Firebase Console**: https://console.firebase.google.com
- **GitHub Actions**: https://github.com/yourusername/career-connect-lesotho/actions
- **Application Status**: https://status.careerconnect.co.ls
- **Deployment History**: https://console.firebase.google.com/project/career-connect-lesotho/hosting/sites

---

**Last Updated:** March 2026  
**Version:** 2.0.0
```

## `/docs/DEVELOPMENT.md`
```markdown
# Development Guide

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher / yarn v1.22.x
- **Git**: Latest version
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - GitLens
  - Material Icon Theme

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/career-connect-lesotho.git
cd career-connect-lesotho/frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Development Workflow

### 1. Branch Strategy

We follow GitFlow branching strategy:

```
main
  ↑
  └── develop
        ↑
        ├── feature/feature-name
        ├── bugfix/bug-description
        ├── release/v2.0.0
        └── hotfix/critical-issue
```

#### Branch Naming Conventions
- `feature/` - New features (e.g., `feature/job-application`)
- `bugfix/` - Bug fixes (e.g., `bugfix/login-error`)
- `hotfix/` - Critical production fixes (e.g., `hotfix/security-patch`)
- `release/` - Release preparation (e.g., `release/v2.0.0`)
- `chore/` - Maintenance tasks (e.g., `chore/update-deps`)

### 2. Local Development

#### Start Development Server
```bash
npm run dev
# Server runs at http://localhost:3000
```

#### Development Features
- Hot Module Replacement (HMR)
- Fast Refresh
- Source Maps
- ESLint warnings in console
- Debug logging enabled

#### Environment Variables
Create `.env.local` for local development:
```env
VITE_APP_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_PROJECT_ID=career-connect-lesotho-dev
# ... other variables
```

### 3. Code Quality

#### Linting
```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### Formatting
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

#### Type Checking
```bash
# Run type checking (if using TypeScript)
npm run type-check

# Or with PropTypes
# No command needed, PropTypes validated at runtime
```

#### Pre-commit Hooks
Husky runs automatically:
- Lint staged files
- Format code
- Run unit tests

### 4. Testing

#### Unit Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- JobList.test.jsx
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run with UI
npm run test:ui
```

#### E2E Tests
```bash
# Run Playwright tests
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui

# Run Cypress tests
npm run test:cypress

# Open Cypress
npm run test:cypress:open
```

### 5. Building

#### Development Build
```bash
# Build for development
npm run build:dev

# Preview build
npm run preview:dev
```

#### Production Build
```bash
# Build for production
npm run build:prod

# Preview production build
npm run preview:prod

# Analyze bundle size
npm run analyze
```

## Project Structure

```
frontend/
├── src/
│   ├── assets/              # Static assets (images, fonts)
│   ├── components/          # Reusable components
│   │   ├── common/          # Shared components
│   │   ├── layout/          # Layout components
│   │   ├── forms/           # Form components
│   │   └── ui/              # UI primitives
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin pages
│   │   ├── student/         # Student pages
│   │   ├── company/         # Company pages
│   │   └── auth/            # Auth pages
│   ├── hooks/               # Custom hooks
│   ├── context/             # React context
│   ├── services/            # API services
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration
│   ├── routing/             # Routing setup
│   └── types/               # Type definitions
├── public/                   # Public assets
├── tests/                    # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # E2E tests
├── docs/                     # Documentation
└── scripts/                  # Build scripts
```

## Coding Standards

### JavaScript/React Style Guide

#### Component Structure
```jsx
// Good component structure
import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Component.module.css';

const Component = ({ title, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    setIsOpen(!isOpen);
    onAction?.();
  };
  
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      <button onClick={handleClick}>
        {isOpen ? 'Close' : 'Open'}
      </button>
    </div>
  );
};

Component.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func
};

Component.defaultProps = {
  onAction: () => {}
};

export default memo(Component);
```

#### Naming Conventions
- **Components**: PascalCase (e.g., `JobCard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.js`)
- **Utils**: camelCase (e.g., `formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)
- **CSS classes**: kebab-case (e.g., `job-card-container`)

#### Imports Order
```jsx
// 1. React and core libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { Button } from '@mui/material';

// 3. Absolute imports (aliases)
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';

// 4. Relative imports
import JobCard from './JobCard';
import styles from './JobList.module.css';
```

### CSS/Styling

#### CSS Modules
```css
/* JobCard.module.css */
.container {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.button {
  composes: btn from './common.module.css';
  background-color: #007bff;
}
```

#### Styled Components (if using)
```jsx
import styled from '@emotion/styled';

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;
```

## State Management

### When to Use What

| State Type | Solution | Example |
|------------|----------|---------|
| Component state | `useState` | Form input values |
| Complex component | `useReducer` | Multi-step forms |
| Server state | React Query | Job listings |
| Global UI state | Context | Theme, notifications |
| URL state | React Router | Filters, pagination |
| Form state | React Hook Form | Application forms |

### React Query Example
```jsx
// hooks/useJobs.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@services/jobService';

export const useJobs = (filters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useApplyForJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, application }) => 
      jobService.applyForJob(jobId, application),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['jobs', variables.jobId]);
      queryClient.invalidateQueries(['applications']);
      toast.success('Application submitted!');
    },
    onError: (error) => {
      toast.error('Failed to submit application');
    }
  });
};
```

### Context Example
```jsx
// context/NotificationContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_READ':
      return {
        ...state,
        unreadCount: 0,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };
  
  const markAllRead = () => {
    dispatch({ type: 'MARK_READ' });
  };
  
  return (
    <NotificationContext.Provider value={{
      ...state,
      addNotification,
      markAllRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
```

## API Integration

### Service Layer Pattern
```jsx
// services/jobService.js
import api from './api';

class JobService {
  async getJobs(params) {
    const response = await api.get('/jobs', { params });
    return response.data;
  }
  
  async getJobById(id) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  }
  
  async createJob(jobData) {
    const response = await api.post('/jobs', jobData);
    return response.data;
  }
  
  async updateJob(id, jobData) {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  }
  
  async deleteJob(id) {
    await api.delete(`/jobs/${id}`);
  }
}

export const jobService = new JobService();
```

### API Client Configuration
```jsx
// services/api.js
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

## Forms and Validation

### React Hook Form with Yup
```jsx
// pages/student/ApplicationForm.jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email required'),
  phone: yup.string().matches(/^\+266\d{8}$/, 'Invalid Lesotho phone number'),
  experience: yup.number().min(0).max(50),
  coverLetter: yup.string().max(2000)
});

const ApplicationForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('fullName')} />
      {errors.fullName && <span>{errors.fullName.message}</span>}
      
      <input {...register('email')} type="email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Routing

### Route Configuration
```jsx
// routing/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '@components/layout/Layout';
import LoadingSpinner from '@components/common/LoadingSpinner';

// Lazy load pages
const Home = lazy(() => import('@pages/Home'));
const StudentDashboard = lazy(() => import('@pages/student/StudentDashboard'));
const CompanyDashboard = lazy(() => import('@pages/company/CompanyDashboard'));
const JobDetails = lazy(() => import('@pages/JobDetails'));
const NotFound = lazy(() => import('@pages/NotFound'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'student',
        element: <ProtectedRoute role="student" />,
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <StudentDashboard />
              </Suspense>
            )
          }
        ]
      },
      {
        path: 'jobs/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <JobDetails />
          </Suspense>
        )
      }
    ]
  }
]);
```

### Protected Routes
```jsx
// components/layout/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

const ProtectedRoute = ({ role }) => {
  const { user, hasRole, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && !hasRole(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
```

## Error Handling

### Error Boundary
```jsx
// components/ErrorBoundary.jsx
import React from 'react';
import { logger } from '@utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logger.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
```

### API Error Handling
```jsx
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { type: 'validation', errors: data.errors };
      case 401:
        return { type: 'auth', message: 'Please login again' };
      case 403:
        return { type: 'auth', message: 'Access denied' };
      case 404:
        return { type: 'notFound', message: 'Resource not found' };
      case 429:
        return { type: 'rateLimit', message: 'Too many requests' };
      case 500:
        return { type: 'server', message: 'Server error' };
      default:
        return { type: 'unknown', message: 'An error occurred' };
    }
  } else if (error.request) {
    // Request made but no response
    return { type: 'network', message: 'Network error' };
  } else {
    // Something else
    return { type: 'unknown', message: error.message };
  }
};
```

## Performance Optimization

### Code Splitting
```jsx
// Lazy load heavy components
const ChartComponent = lazy(() => import('@components/charts/ChartComponent'));

// In component
{showChart && (
  <Suspense fallback={<ChartSkeleton />}>
    <ChartComponent data={data} />
  </Suspense>
)}
```

### Memoization
```jsx
// Expensive computations
const filteredJobs = useMemo(() => {
  return jobs.filter(job => job.salary >= minSalary);
}, [jobs, minSalary]);

// Callback functions
const handleApply = useCallback((jobId) => {
  applyForJob(jobId);
}, [applyForJob]);

// Component memoization
const JobCard = memo(({ job, onApply }) => {
  return <div>{job.title}</div>;
});
```

### Virtual Lists
```jsx
import { FixedSizeList as List } from 'react-window';

const JobList = ({ jobs }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <JobCard job={jobs[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={jobs.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## Debugging Tips

### Chrome DevTools
- **React DevTools**: Inspect component hierarchy
- **Redux DevTools**: If using Redux
- **Network tab**: Monitor API calls
- **Performance tab**: Profile performance

### Console Logging
```jsx
// Use logger instead of console.log
import { logger } from '@utils/logger';

logger.debug('Debug info', { data });
logger.info('User action', { action });
logger.warn('Warning', { issue });
logger.error('Error', { error });
```

### VS Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/frontend/node_modules/vitest/vitest.mjs",
      "args": ["--run", "--testTimeout=1000000"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Common Tasks

### Adding a New Page
1. Create page component in `src/pages/[category]/`
2. Add route in `src/routing/`
3. Add link in navigation
4. Add to `ProtectedRoute` if needed

### Adding a New API Endpoint
1. Add method in service class
2. Add API call in hooks
3. Handle errors
4. Add to mock handlers for testing

### Adding Environment Variables
1. Add to `.env.example`
2. Add to all environment files
3. Add to GitHub secrets
4. Access via `import.meta.env.VITE_VAR_NAME`

### Adding Dependencies
```bash
# Production dependency
npm install package-name

# Development dependency
npm install --save-dev package-name

# Peer dependency
npm install --save-peer package-name
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:local        # Start with local env
npm run dev:prod         # Start with prod env (testing)

# Building
npm run build            # Build for current env
npm run build:prod       # Build for production
npm run analyze          # Analyze bundle size

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix lint issues
npm run format           # Format code
npm run type-check       # Check types

# Deployment
npm run deploy:dev       # Deploy to dev
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production

# Utility
npm run clean            # Clean build artifacts
npm run validate         # Full validation
npm run security         # Security audit
```

## Troubleshooting

### Common Issues

#### "Module not found"
```bash
# Clear cache
npm run clean
npm install
```

#### "Port already in use"
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

#### "ESLint errors"
```bash
# Fix auto-fixable issues
npm run lint:fix

# Check ESLint config
npx eslint --print-config .eslintrc.js
```

#### "Tests failing"
```bash
# Update snapshots
npm run test -u

# Run specific test
npm test -- JobList.test.jsx

# Debug mode
npm test -- --debug
```

## Resources

### Documentation
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Material UI](https://mui.com)

### Internal Docs
- [API Documentation](./API.md)
- [Testing Guide](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Architecture Overview](./ARCHITECTURE.md)

### Community
- [GitHub Issues](https://github.com/yourusername/career-connect-lesotho/issues)
- [Discussions](https://github.com/yourusername/career-connect-lesotho/discussions)
- [Slack Channel](https://career-connect.slack.com)

---

**Last Updated:** March 2026  
**Version:** 2.0.0
```
