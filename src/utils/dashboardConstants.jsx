// src/utils/dashboardConstants.js
export const DASHBOARD_PATHS = {
  ADMIN: '/admin/dashboard',
  YOUTH: '/youth/dashboard',
  STUDENT: '/student/dashboard',
  COMPANY: '/company/dashboard',
  ENTREPRENEUR: '/entrepreneur/dashboard',
  INSTITUTE: '/institute/dashboard',
  EMPLOYER: '/employer/dashboard'
};

export const USER_TYPES = {
  ADMIN: 'admin',
  YOUTH: 'youth',
  STUDENT: 'student',
  COMPANY: 'company',
  ENTREPRENEUR: 'entrepreneur',
  INSTITUTE: 'institute',
  EMPLOYER: 'employer'
};

export const getUserDashboardPath = (userType) => {
  switch (userType) {
    case USER_TYPES.ADMIN:
      return DASHBOARD_PATHS.ADMIN;
    case USER_TYPES.YOUTH:
      return DASHBOARD_PATHS.YOUTH;
    case USER_TYPES.STUDENT:
      return DASHBOARD_PATHS.STUDENT;
    case USER_TYPES.COMPANY:
      return DASHBOARD_PATHS.COMPANY;
    case USER_TYPES.ENTREPRENEUR:
      return DASHBOARD_PATHS.ENTREPRENEUR;
    case USER_TYPES.INSTITUTE:
      return DASHBOARD_PATHS.INSTITUTE;
    case USER_TYPES.EMPLOYER:
      return DASHBOARD_PATHS.EMPLOYER;
    default:
      return '/dashboard';
  }
};