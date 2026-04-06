// src/utils/validationSchemas.js
import * as yup from 'yup';

// Profile validation schema
export const profileValidationSchema = yup.object().shape({
  // Personal Information
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .matches(
      /^[a-zA-Z\s'.-]+$/, // FIXED: Proper regex escaping
      'Full name can only contain letters, spaces, hyphens, apostrophes, and periods'
    ),

  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),

  phone: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .matches(
      /^(\+266|0)?[2-8]\d{7}$/, // FIXED: Proper regex for Lesotho phone numbers
      'Please enter a valid Lesotho phone number (e.g., +26612345678 or 12345678)'
    ),

  dateOfBirth: yup
    .date()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .max(new Date(), 'Date of birth cannot be in the future')
    .test(
      'age',
      'You must be at least 16 years old',
      (value) => !value || new Date().getFullYear() - new Date(value).getFullYear() >= 16
    ),

  gender: yup
    .string()
    .nullable()
    .oneOf(['male', 'female', 'other', 'prefer-not-to-say', ''], 'Please select a valid gender'),

  address: yup.string().nullable().max(200, 'Address must be less than 200 characters'),

  // Academic Information
  studentId: yup
    .string()
    .required('Student ID is required')
    .min(3, 'Student ID must be at least 3 characters')
    .max(20, 'Student ID must be less than 20 characters'),

  institution: yup
    .string()
    .required('Institution is required')
    .min(2, 'Institution name must be at least 2 characters')
    .max(100, 'Institution name must be less than 100 characters'),

  course: yup
    .string()
    .required('Course/Program is required')
    .min(2, 'Course name must be at least 2 characters')
    .max(100, 'Course name must be less than 100 characters'),

  yearOfStudy: yup
    .string()
    .required('Year of study is required')
    .oneOf(['1', '2', '3', '4', '5+'], 'Please select a valid year of study'),

  // Skills and Bio
  skills: yup
    .array()
    .of(
      yup.string().min(1, 'Skill cannot be empty').max(50, 'Skill must be less than 50 characters')
    )
    .max(20, 'Maximum 20 skills allowed'),

  bio: yup.string().nullable().max(500, 'Bio must be less than 500 characters'),

  careerGoals: yup.string().nullable().max(500, 'Career goals must be less than 500 characters'),

  // Social Links
  'socialLinks.linkedin': yup
    .string()
    .nullable()
    .url('Please enter a valid LinkedIn URL')
    .matches(
      /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/, // FIXED: Proper regex escaping
      'Please enter a valid LinkedIn profile URL'
    ),

  'socialLinks.github': yup
    .string()
    .nullable()
    .url('Please enter a valid GitHub URL')
    .matches(
      /^(https?:\/\/)?(www\.)?github\.com\/.*$/, // FIXED: Proper regex escaping
      'Please enter a valid GitHub profile URL'
    ),

  'socialLinks.portfolio': yup.string().nullable().url('Please enter a valid portfolio URL'),

  // Preferences
  jobPreferences: yup.object().shape({
    jobType: yup
      .string()
      .nullable()
      .oneOf(['full-time', 'part-time', 'internship', 'contract', 'remote', '']),

    locationPreference: yup
      .string()
      .nullable()
      .max(100, 'Location preference must be less than 100 characters'),

    salaryExpectation: yup
      .string()
      .nullable()
      .matches(
        /^(\d+)(-\d+)?$/, // FIXED: Proper regex for salary range
        'Please enter a valid salary range (e.g., 10000 or 10000-15000)'
      ),

    industryInterests: yup
      .string()
      .nullable()
      .max(500, 'Industry interests must be less than 500 characters'),
  }),
});

// File validation schemas
export const fileValidationSchemas = {
  profilePhoto: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    maxDimensions: { width: 5000, height: 5000 },
    minDimensions: { width: 100, height: 100 },
    aspectRatio: 1, // Square
  },

  resume: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.pdf', '.doc', '.docx'],
  },

  document: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ],
    maxSize: 10 * 1024 * 1024,
    allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  },
};

// Validation helper functions
export const validateProfile = (data) => {
  try {
    profileValidationSchema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    }
    return { isValid: false, errors };
  }
};

export const validateFile = (file, fileType = 'document') => {
  const schema = fileValidationSchemas[fileType];
  if (!schema) {
    return Promise.resolve({ isValid: false, error: 'Invalid file type' });
  }

  const errors = [];

  // Check file type
  if (!schema.allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${schema.allowedTypes.join(', ')}`);
  }

  // Check file size
  if (file.size > schema.maxSize) {
    const maxSizeMB = (schema.maxSize / (1024 * 1024)).toFixed(0);
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Check image dimensions if applicable
  if (fileType === 'profilePhoto' && file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > schema.maxDimensions.width || img.height > schema.maxDimensions.height) {
          errors.push(
            `Image dimensions too large. Maximum: ${schema.maxDimensions.width}x${schema.maxDimensions.height}px`
          );
        }
        if (img.width < schema.minDimensions.width || img.height < schema.minDimensions.height) {
          errors.push(
            `Image dimensions too small. Minimum: ${schema.minDimensions.width}x${schema.minDimensions.height}px`
          );
        }
        resolve({
          isValid: errors.length === 0,
          errors: errors.length > 0 ? errors.join(' ') : null,
        });
      };
      img.onerror = () => {
        errors.push('Invalid image file');
        resolve({
          isValid: false,
          errors: errors.join(' '),
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  return Promise.resolve({
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors.join(' ') : null,
  });
};

// Field-specific validation
export const validateEmail = (email) => {
  const emailRegex = /^[^.@]+@[^.@]+\.[^.@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  const phoneRegex = /^(266)?[2-8]\d{7}$/; // FIXED: Proper regex for Lesotho phone numbers
  if (!phoneRegex.test(digitsOnly)) {
    return 'Please enter a valid Lesotho phone number (e.g., +26612345678 or 12345678)';
  }
  return null;
};

export const validateStudentId = (studentId) => {
  if (!studentId) return 'Student ID is required';
  if (studentId.length < 3) return 'Student ID must be at least 3 characters';
  if (studentId.length > 20) return 'Student ID must be less than 20 characters';
  return null;
};

export const validateFullName = (fullName) => {
  if (!fullName) return 'Full name is required';
  if (fullName.length < 2) return 'Full name must be at least 2 characters';
  if (fullName.length > 100) return 'Full name must be less than 100 characters';
  const nameRegex = /^[a-zA-Z\s'.-]+$/; // FIXED: Proper regex
  if (!nameRegex.test(fullName)) {
    return 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods';
  }
  return null;
};

// Form submission validation
export const validateProfileForm = (formData) => {
  const errors = {};
  let hasErrors = false;

  // Required fields
  const requiredFields = ['fullName', 'email', 'studentId', 'institution', 'course', 'yearOfStudy'];
  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      hasErrors = true;
    }
  });

  // Email validation
  if (formData.email) {
    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
      hasErrors = true;
    }
  }

  // Phone validation
  if (formData.phone) {
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      errors.phone = phoneError;
      hasErrors = true;
    }
  }

  return { isValid: !hasErrors, errors };
};

export default {
  profileValidationSchema,
  fileValidationSchemas,
  validateProfile,
  validateFile,
  validateEmail,
  validatePhone,
  validateStudentId,
  validateFullName,
  validateProfileForm,
};
