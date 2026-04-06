/* eslint-disable no-useless-escape */
// Company dashboard helper functions

export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const calculateTimeToHire = (applications) => {
  const hiredApplications = applications.filter(
    (app) => app.status === 'hired' && app.appliedAt && app.hiredAt
  );

  if (hiredApplications.length === 0) return 0;

  const totalDays = hiredApplications.reduce((sum, app) => {
    const applied = new Date(app.appliedAt);
    const hired = new Date(app.hiredAt);
    const diffTime = Math.abs(hired - applied);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / hiredApplications.length);
};

export const calculateMatchScore = (application, job, candidate) => {
  let score = 0;
  const maxScore = 100;

  // Skills match (40 points)
  const jobSkills = job?.skills || [];
  const candidateSkills = candidate?.skills || [];
  const matchedSkills = jobSkills.filter((skill) =>
    candidateSkills.some(
      (candidateSkill) =>
        candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(candidateSkill.toLowerCase())
    )
  );

  if (jobSkills.length > 0) {
    score += (matchedSkills.length / jobSkills.length) * 40;
  }

  // Experience level match (30 points)
  const experienceLevels = { entry: 1, mid: 2, senior: 3, executive: 4 };
  const jobExp = experienceLevels[job?.experience || 'entry'];
  const candidateExp = experienceLevels[candidate?.experienceLevel || 'entry'];

  if (candidateExp >= jobExp) {
    score += 30;
  } else {
    score += (candidateExp / jobExp) * 30;
  }

  // Location match (15 points)
  if (job?.location && candidate?.location) {
    const jobLoc = job.location.toLowerCase();
    const candidateLoc = candidate.location.toLowerCase();

    if (jobLoc.includes('remote') || candidateLoc.includes('remote')) {
      score += 15;
    } else if (jobLoc === candidateLoc) {
      score += 15;
    }
  }

  // Education match (15 points)
  const requiredEducation = job?.education || [];
  const candidateEducation = candidate?.education || [];

  if (requiredEducation.length > 0) {
    const hasRequiredEducation = requiredEducation.some((reqEdu) =>
      candidateEducation.some(
        (candidateEdu) =>
          candidateEdu.degree?.toLowerCase().includes(reqEdu.toLowerCase()) ||
          candidateEdu.field?.toLowerCase().includes(reqEdu.toLowerCase())
      )
    );

    if (hasRequiredEducation) {
      score += 15;
    }
  } else {
    score += 15;
  }

  return Math.min(Math.round(score), maxScore);
};

export const getTimeAgo = (date) => {
  if (!date) return 'Just now';

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

export const formatCurrency = (amount, currency = 'LSL') => {
  if (!amount) return 'Negotiable';

  const formatter = new Intl.NumberFormat('en-LS', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

export const getJobTypeBadge = (type) => {
  const types = {
    'full-time': { variant: 'success', label: 'Full-time' },
    'part-time': { variant: 'info', label: 'Part-time' },
    contract: { variant: 'warning', label: 'Contract' },
    internship: { variant: 'primary', label: 'Internship' },
    remote: { variant: 'dark', label: 'Remote' },
  };

  return types[type] || { variant: 'secondary', label: type };
};

export const getExperienceLevel = (level) => {
  const levels = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior Level',
    executive: 'Executive',
  };

  return levels[level] || level;
};

export const validateEmail = (email) => {
  const re = /^[^.@]+@[^.@]+.[^.@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[+]?[1-9][.]{0,15}$/;
  return re.test(phone.replace(/[....]/g, ''));
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateRandomId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const sortByProperty = (array, property, order = 'asc') => {
  return [...array].sort((a, b) => {
    let aValue = a[property];
    let bValue = b[property];

    // Handle dates
    if (aValue instanceof Date) aValue = aValue.getTime();
    if (bValue instanceof Date) bValue = bValue.getTime();

    // Handle strings
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (order === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
};

export const filterArray = (array, filters) => {
  return array.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      return item[key] === value;
    });
  });
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const getStatusColor = (status) => {
  const colors = {
    active: '#28a745',
    pending: '#ffc107',
    inactive: '#6c757d',
    completed: '#28a745',
    failed: '#dc3545',
    processing: '#17a2b8',
    draft: '#6c757d',
    published: '#28a745',
    archived: '#6c757d',
  };
  return colors[status] || '#6c757d';
};

export const formatDate = (date, format = 'medium') => {
  if (!date) return 'N/A';

  const dateObj = date instanceof Date ? date : new Date(date);

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } else if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } else {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';

  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

export const generateQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
};

export const cloneObject = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const mergeObjects = (target, source) => {
  return { ...target, ...source };
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const isNotEmpty = (value) => {
  return !isEmpty(value);
};

export const capitalize = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const capitalizeWords = (string) => {
  if (!string) return '';
  return string
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/.+/g, '-')
    .replace(/[^..]+/g, '')
    .replace(/..+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /./.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return {
    isValid:
      password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      length: password.length >= minLength,
      upperCase: hasUpperCase,
      lowerCase: hasLowerCase,
      numbers: hasNumbers,
      specialChar: hasSpecialChar,
    },
  };
};

export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async (fn, retries = 3, delayMs = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await delay(delayMs);
    return retry(fn, retries - 1, delayMs * 2);
  }
};

export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  formatNumber,
  calculateTimeToHire,
  calculateMatchScore,
  getTimeAgo,
  formatCurrency,
  getJobTypeBadge,
  getExperienceLevel,
  validateEmail,
  validatePhone,
  truncateText,
  debounce,
  formatFileSize,
  generateRandomId,
  getInitials,
  sortByProperty,
  filterArray,
  groupBy,
  chunkArray,
  calculatePercentage,
  getStatusColor,
  formatDate,
  formatDateTime,
  isValidUrl,
  sanitizeInput,
  parseQueryString,
  generateQueryString,
  cloneObject,
  mergeObjects,
  isEmpty,
  isNotEmpty,
  capitalize,
  capitalizeWords,
  slugify,
  generatePassword,
  validatePassword,
  delay,
  retry,
  memoize,
  throttle,
};
