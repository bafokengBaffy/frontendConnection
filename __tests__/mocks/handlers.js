import { http, HttpResponse } from 'msw';

// Mock data
import users from '../../test/fixtures/users.json';
import companies from '../../test/fixtures/companies.json';
import jobs from '../../test/fixtures/jobs.json';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'student@test.com' && password === 'Test123!@#') {
      return HttpResponse.json({
        user: users.student,
        token: 'mock-jwt-token',
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const userData = await request.json();
    return HttpResponse.json(
      {
        user: { ...userData, id: 'new-user-123' },
        token: 'mock-jwt-token',
      },
      { status: 201 }
    );
  }),

  http.get('/api/auth/user', () => {
    return HttpResponse.json(users.student);
  }),

  // Jobs endpoints
  http.get('/api/jobs', () => {
    return HttpResponse.json(jobs);
  }),

  http.get('/api/jobs/:id', ({ params }) => {
    const job = jobs.find((j) => j.id === params.id);
    if (job) {
      return HttpResponse.json(job);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/jobs/:id/apply', () => {
    return HttpResponse.json({ success: true, applicationId: 'app-123' });
  }),

  // Companies endpoints
  http.get('/api/companies', () => {
    return HttpResponse.json(companies);
  }),

  http.get('/api/companies/:id', ({ params }) => {
    const company = companies.find((c) => c.id === params.id);
    if (company) {
      return HttpResponse.json(company);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Applications endpoints
  http.get('/api/applications', () => {
    return HttpResponse.json([
      { id: 'app-1', jobId: 'job-1', status: 'pending' },
      { id: 'app-2', jobId: 'job-2', status: 'reviewed' },
    ]);
  }),

  // User profile
  http.get('/api/profile', () => {
    return HttpResponse.json(users.student);
  }),

  http.put('/api/profile', async ({ request }) => {
    const updates = await request.json();
    return HttpResponse.json({ ...users.student, ...updates });
  }),

  // Notifications
  http.get('/api/notifications', () => {
    return HttpResponse.json([
      { id: 'notif-1', message: 'New job match!', read: false },
      { id: 'notif-2', message: 'Application viewed', read: true },
    ]);
  }),

  // Analytics
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json({
      views: 1234,
      applications: 56,
      matches: 89,
      profileCompleteness: 75,
    });
  }),
];
