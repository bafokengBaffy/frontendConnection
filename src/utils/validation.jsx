export const validation = {
  // Email validation with disposable email blocking
  email: (email) => {
    const errors = [];

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
      return { isValid: false, errors };
    }

    const domain = email.split('@')[1].toLowerCase();
    const disposableDomains = [
      'tempmail.com',
      'throwaway.com',
      'mailinator.com',
      'guerrillamail.com',
      'sharklasers.com',
      'grr.la',
      'yopmail.com',
      'temp-mail.org',
      'fakeinbox.com',
      '10minutemail.com',
      'burnermail.io',
      'discard.email',
      'maildrop.cc',
      'spam4.me',
      'trashmail.com',
      'wegwerfmail.de',
      'spamgourmet.com',
    ];

    if (disposableDomains.includes(domain)) {
      errors.push('Disposable email addresses are not allowed');
    }

    if (email.length > 254) {
      errors.push('Email address is too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Enhanced password validation
  password: (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (password.length > 128) {
      errors.push('Password too long (max 128 characters)');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*()_+.=[.{};':".|,.<>/?]/.test(password)) {
      errors.push('One special character');
    }
    if (/(.).{3,}/.test(password)) {
      errors.push("No repeated characters (e.g., 'aaaa')");
    }

    const commonPasswords = [
      'password123',
      'admin123',
      '12345678',
      'qwerty123',
      'password1',
      'abc12345',
      'letmein123',
      'welcome123',
      'monkey123',
      'dragon123',
      'master123',
      'superman123',
      'iloveyou123',
      'football123',
      'baseball123',
      'sunshine123',
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('This password is too common and easily guessable');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: calculatePasswordStrength(password),
    };
  },

  // Name validation
  name: (name) => {
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push('Name is required');
    } else {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        errors.push('Name must be at least 2 characters');
      }
      if (trimmed.length > 50) {
        errors.push('Name must be less than 50 characters');
      }
      if (!/^[a-zA-Z.'-]+$/.test(trimmed)) {
        errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
      }
      if (/.{2,}/.test(trimmed)) {
        errors.push('Name cannot contain multiple consecutive spaces');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Company name validation
  companyName: (name) => {
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push('Company name is required');
    } else {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        errors.push('Company name must be at least 2 characters');
      }
      if (trimmed.length > 100) {
        errors.push('Company name must be less than 100 characters');
      }
      if (!/^[a-zA-Z0-9.&'.,-]+$/.test(trimmed)) {
        errors.push('Company name contains invalid characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Phone number validation (international format)
  phone: (phone) => {
    if (!phone) return { isValid: true, errors: [] };

    const errors = [];
    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-..]?[(]?[0-9]{1,4}[)]?[-..]?[0-9]{1,9}[-..]?[0-9]{1,9}$/;

    if (!phoneRegex.test(phone)) {
      errors.push('Please enter a valid phone number');
    }
    if (phone.replace(/./g, '').length < 8) {
      errors.push('Phone number must have at least 8 digits');
    }
    if (phone.replace(/./g, '').length > 15) {
      errors.push('Phone number is too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Website validation
  website: (url) => {
    if (!url) return { isValid: true, errors: [] };

    const errors = [];
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('Website must start with http:// or https://');
      }
      if (urlObj.hostname.split('.').length < 2) {
        errors.push('Please enter a valid domain');
      }
    } catch {
      errors.push('Please enter a valid URL (e.g., https://example.com)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Industry validation
  industry: (industry) => {
    const errors = [];
    const validIndustries = [
      'technology',
      'finance',
      'healthcare',
      'education',
      'retail',
      'manufacturing',
      'construction',
      'marketing',
      'consulting',
      'hospitality',
      'media',
      'telecommunications',
      'transportation',
      'energy',
      'agriculture',
      'nonprofit',
      'government',
      'other',
    ];

    if (!industry) {
      errors.push('Please select an industry');
    } else if (!validIndustries.includes(industry)) {
      errors.push('Please select a valid industry');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Helper function to calculate password strength
function calculatePasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (/(.).{3,}/.test(password)) score = Math.max(0, score - 2);

  return Math.min(10, score);
}
