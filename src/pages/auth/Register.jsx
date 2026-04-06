/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Modal,
  Badge,
  ProgressBar,
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaGoogle,
  FaGraduationCap,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaUser,
  FaCheckCircle,
  FaShieldAlt,
  FaExclamationTriangle,
  FaArrowRight,
  FaArrowLeft,
  FaBriefcase,
  FaIndustry,
  FaPhone,
  FaGlobe,
  FaUsers,
  FaRocket,
  FaEye,
  FaEyeSlash,
  FaCheckDouble,
  FaEnvelopeOpenText,
  FaClock,
  FaUniversity,
  FaChalkboardTeacher,
  FaUserTie,
  FaStore,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import './Registration.css';

const ReCAPTCHA = React.forwardRef(({ onChange }, ref) => {
  const [verified, setVerified] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setVerified(false);
        onChange?.('');
      },
    }),
    [onChange]
  );

  const handleChange = (event) => {
    const isChecked = event.target.checked;
    setVerified(isChecked);
    onChange?.(isChecked ? 'local-recaptcha-verified' : '');
  };

  return (
    <Form.Check
      type="checkbox"
      id="recaptcha-fallback"
      label="I am not a robot"
      checked={verified}
      onChange={handleChange}
    />
  );
});

ReCAPTCHA.displayName = 'ReCAPTCHAFallback';

// User types configuration
const USER_TYPES = [
  {
    value: 'student',
    label: 'Student / Graduate',
    description: 'Find internships, jobs, and launch your career',
    icon: <FaGraduationCap className="display-4" />,
    gradient: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
    color: '#4158D0',
    requiresApproval: false,
    benefits: [
      'AI-powered job matching',
      'Free career resources',
      'Network with employers',
      'Track applications',
    ],
    steps: ['Account Type', 'Personal Info', 'Education', 'Verify'],
  },
  {
    value: 'company',
    label: 'Company / Employer',
    description: 'Hire talent, post jobs, and build your team',
    icon: <FaBuilding className="display-4" />,
    gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
    color: '#0093E9',
    requiresApproval: true,
    benefits: [
      'Smart candidate screening',
      'Analytics dashboard',
      'Verified employer badge',
      'AI matching',
    ],
    steps: ['Account Type', 'Basic Info', 'Company Details', 'Verify'],
  },
  {
    value: 'institute',
    label: 'Educational Institute',
    description: 'Connect students with opportunities',
    icon: <FaUniversity className="display-4" />,
    gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
    color: '#8E2DE2',
    requiresApproval: true,
    benefits: ['Manage courses', 'Track placements', 'Connect with employers', 'Student analytics'],
    steps: ['Account Type', 'Basic Info', 'Institute Details', 'Verify'],
  },
  {
    value: 'mentor',
    label: 'Mentor / Advisor',
    description: 'Guide the next generation of talent',
    icon: <FaChalkboardTeacher className="display-4" />,
    gradient: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
    color: '#F2994A',
    requiresApproval: true,
    benefits: ['Share expertise', 'Flexible scheduling', 'Earn income', 'Build reputation'],
    steps: ['Account Type', 'Personal Info', 'Professional Details', 'Verify'],
  },
  {
    value: 'youth',
    label: 'Youth Entrepreneur',
    description: 'Start and grow your business',
    icon: <FaRocket className="display-4" />,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: '#11998e',
    requiresApproval: false,
    benefits: ['Business resources', 'Mentorship access', 'Funding opportunities', 'Networking'],
    steps: ['Account Type', 'Personal Info', 'Business Idea', 'Verify'],
  },
  {
    value: 'entrepreneur',
    label: 'Entrepreneur',
    description: 'Scale your existing business',
    icon: <FaUserTie className="display-4" />,
    gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    color: '#ee0979',
    requiresApproval: true,
    benefits: ['Investor connections', 'Market insights', 'Growth tools', 'Partner matching'],
    steps: ['Account Type', 'Company Info', 'Business Details', 'Verify'],
  },
];

// Industry options
const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Construction',
  'Marketing',
  'Consulting',
  'Hospitality',
  'Media',
  'Telecommunications',
  'Transportation',
  'Energy',
  'Agriculture',
  'Nonprofit',
  'Government',
  'Other',
];

// Company size options
const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

// Education levels
const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Vocational Training',
  'Self-taught',
  'Other',
];

// Business stages
const BUSINESS_STAGES = [
  'Idea Stage',
  'Planning',
  'MVP Development',
  'Launched',
  'Growth Stage',
  'Scaling',
  'Established',
];

// Mentorship expertise areas
const EXPERTISE_AREAS = [
  'Career Guidance',
  'Resume Review',
  'Interview Prep',
  'Leadership',
  'Technical Skills',
  'Soft Skills',
  'Industry Insights',
  'Networking',
  'Entrepreneurship',
  'Work-Life Balance',
];

const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialUserType = queryParams.get('type') || '';

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Common fields
    userType: initialUserType || '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    acceptMarketing: false,
    recaptchaToken: '',

    // Student specific
    educationLevel: '',
    institution: '',
    fieldOfStudy: '',
    graduationYear: '',

    // Company specific
    companyName: '',
    industry: '',
    companySize: '',
    website: '',

    // Institute specific
    instituteName: '',
    instituteType: '',
    accreditation: '',
    establishedYear: '',

    // Mentor specific
    title: '',
    expertise: [],
    yearsOfExperience: '',
    hourlyRate: '',
    bio: '',

    // Youth specific
    businessName: '',
    businessStage: '',
    businessIndustry: '',
    businessDescription: '',

    // Entrepreneur specific
    entrepreneurCompanyName: '',
    entrepreneurIndustry: '',
    teamSize: '',
    fundingStage: '',
    lookingForInvestment: false,
    lookingForMentors: false,
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false,
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Constants
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

  // Hooks
  const { register: authRegister, loginWithGoogle, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef();
  const verificationInputs = useRef([]);

  const getDashboardPathByUserType = (userType) => {
    const dashboardMap = {
      student: '/student/dashboard',
      company: '/company/dashboard',
      institute: '/institute/dashboard',
      mentor: '/mentor/dashboard',
      youth: '/youth/dashboard',
      entrepreneur: '/entrepreneur/dashboard',
      admin: '/admin/dashboard',
    };

    return dashboardMap[userType] || '/student/dashboard';
  };

  // Get current user type config
  const currentUserType = USER_TYPES.find((t) => t.value === formData.userType) || USER_TYPES[0];
  const totalSteps = currentUserType?.steps?.length || 4;

  // Countdown timer for verification
  useEffect(() => {
    if (showVerificationModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setResendEnabled(true);
    }
  }, [showVerificationModal, countdown]);

  // Password strength calculation
  useEffect(() => {
    if (formData.password) {
      const validationResult = validatePasswordStrength(formData.password);
      setPasswordStrength(validationResult);
    }
  }, [formData.password]);

  // Password strength validator
  const validatePasswordStrength = (password) => {
    const errors = [];
    let strength = 0;

    if (password.length >= 8) {
      strength += 2;
    } else {
      errors.push('at least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      strength += 2;
    } else {
      errors.push('one uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      strength += 2;
    } else {
      errors.push('one lowercase letter');
    }

    if (/[0-9]/.test(password)) {
      strength += 2;
    } else {
      errors.push('one number');
    }

    if (/[!@#$%^&*()_+.=..{};':".|,.<>.?]/.test(password)) {
      strength += 2;
    } else {
      errors.push('one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(10, strength),
      label: strength >= 8 ? 'Strong' : strength >= 5 ? 'Medium' : 'Weak',
    };
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle user type selection
  const handleUserTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, userType: type }));
    setErrors((prev) => ({ ...prev, userType: '' }));
    setCurrentStep(2);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setTouched((prev) => ({ ...prev, [name]: true }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle expertise selection (multi-select)
  const handleExpertiseChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData((prev) => ({ ...prev, expertise: selected }));
  };

  // Validate current step
  const validateStep = () => {
    const newErrors = {};

    // Step 2 validation (common for all)
    if (currentStep === 2) {
      if (!formData.fullName?.trim()) {
        newErrors.fullName = 'Full name is required';
      }

      if (!formData.email?.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!passwordStrength.isValid) {
        newErrors.password = `Password must contain: ${passwordStrength.errors.join(', ')}`;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Step 3 validation (type-specific)
    if (currentStep === 3) {
      switch (formData.userType) {
        case 'student':
          if (!formData.educationLevel) {
            newErrors.educationLevel = 'Education level is required';
          }
          if (!formData.institution?.trim()) {
            newErrors.institution = 'Institution name is required';
          }
          break;

        case 'company':
          if (!formData.companyName?.trim()) {
            newErrors.companyName = 'Company name is required';
          }
          if (!formData.industry) {
            newErrors.industry = 'Industry is required';
          }
          if (formData.website && !/^https?:...+..+/.test(formData.website)) {
            newErrors.website = 'Please enter a valid URL';
          }
          break;

        case 'institute':
          if (!formData.instituteName?.trim()) {
            newErrors.instituteName = 'Institute name is required';
          }
          if (!formData.instituteType) {
            newErrors.instituteType = 'Institute type is required';
          }
          break;

        case 'mentor':
          if (!formData.title?.trim()) {
            newErrors.title = 'Professional title is required';
          }
          if (formData.expertise.length === 0) {
            newErrors.expertise = 'Please select at least one expertise area';
          }
          if (!formData.yearsOfExperience) {
            newErrors.yearsOfExperience = 'Years of experience is required';
          }
          break;

        case 'youth':
          if (!formData.businessName?.trim()) {
            newErrors.businessName = 'Business name is required';
          }
          if (!formData.businessStage) {
            newErrors.businessStage = 'Business stage is required';
          }
          if (!formData.businessIndustry) {
            newErrors.businessIndustry = 'Industry is required';
          }
          break;

        case 'entrepreneur':
          if (!formData.entrepreneurCompanyName?.trim()) {
            newErrors.entrepreneurCompanyName = 'Company name is required';
          }
          if (!formData.entrepreneurIndustry) {
            newErrors.entrepreneurIndustry = 'Industry is required';
          }
          if (!formData.businessStage) {
            newErrors.businessStage = 'Business stage is required';
          }
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  // Google Registration
  const handleGoogleRegistration = async () => {
    if (!formData.userType) {
      setErrors({ submit: 'Please select your account type first' });
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (attemptCount >= MAX_ATTEMPTS && now - lastAttemptTime < LOCKOUT_TIME) {
      const minutesLeft = Math.ceil((LOCKOUT_TIME - (now - lastAttemptTime)) / 60000);
      setErrors({ submit: `Too many attempts. Please try again in ${minutesLeft} minutes.` });
      return;
    }

    setIsGoogleLoading(true);
    setErrors({});

    try {
      // Prepare registration data based on user type
      const registrationData = {
        userType: formData.userType,
        fullName: formData.fullName || undefined,
        phone: formData.phone || undefined,
      };

      // Add type-specific data
      switch (formData.userType) {
        case 'student':
          registrationData.educationLevel = formData.educationLevel;
          registrationData.institution = formData.institution;
          registrationData.fieldOfStudy = formData.fieldOfStudy;
          registrationData.graduationYear = formData.graduationYear;
          break;
        case 'company':
          registrationData.companyName = formData.companyName;
          registrationData.industry = formData.industry;
          registrationData.companySize = formData.companySize;
          registrationData.website = formData.website;
          break;
        case 'institute':
          registrationData.instituteName = formData.instituteName;
          registrationData.instituteType = formData.instituteType;
          registrationData.accreditation = formData.accreditation;
          registrationData.establishedYear = formData.establishedYear;
          break;
        case 'mentor':
          registrationData.title = formData.title;
          registrationData.expertise = formData.expertise;
          registrationData.yearsOfExperience = formData.yearsOfExperience;
          registrationData.hourlyRate = formData.hourlyRate;
          registrationData.bio = formData.bio;
          break;
        case 'youth':
          registrationData.businessName = formData.businessName;
          registrationData.businessStage = formData.businessStage;
          registrationData.businessIndustry = formData.businessIndustry;
          registrationData.businessDescription = formData.businessDescription;
          break;
        case 'entrepreneur':
          registrationData.companyName = formData.entrepreneurCompanyName;
          registrationData.industry = formData.entrepreneurIndustry;
          registrationData.businessStage = formData.businessStage;
          registrationData.teamSize = formData.teamSize;
          registrationData.fundingStage = formData.fundingStage;
          registrationData.lookingForInvestment = formData.lookingForInvestment;
          registrationData.lookingForMentors = formData.lookingForMentors;
          break;
      }

      const result = await loginWithGoogle(registrationData);

      if (!result.success) {
        setAttemptCount((prev) => prev + 1);
        setLastAttemptTime(now);
        throw new Error(result.error || 'Google registration failed');
      }

      // Reset attempts on success
      setAttemptCount(0);

      const dashboardPath = getDashboardPathByUserType(result.userType || formData.userType);

      navigate(dashboardPath, {
        state: {
          message: `Welcome to Career Connect! Your ${currentUserType.label} account has been created successfully.`,
          type: 'success',
        },
      });
    } catch (error) {
      console.error('Google registration error:', error);

      let errorMessage = 'Google authentication failed. Please try again.';
      if (error.message?.includes('popup-closed')) {
        errorMessage = 'Google sign-up was cancelled.';
      } else if (error.message?.includes('popup-blocked')) {
        errorMessage = 'Popup blocked. Please allow popups for this site.';
      } else if (error.message?.includes('account-exists')) {
        errorMessage = 'An account already exists with this email. Please login instead.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage =
          'An account already exists with this email using a different sign-in method.';
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Manual Registration
  const handleManualRegistration = async (e) => {
    e.preventDefault();

    if (!formData.recaptchaToken) {
      setErrors({ submit: 'Please complete the reCAPTCHA verification' });
      return;
    }

    if (!formData.acceptTerms) {
      setErrors({ submit: 'You must accept the Terms of Service to continue' });
      return;
    }

    // Rate limiting
    const now = Date.now();
    if (attemptCount >= MAX_ATTEMPTS && now - lastAttemptTime < LOCKOUT_TIME) {
      const minutesLeft = Math.ceil((LOCKOUT_TIME - (now - lastAttemptTime)) / 60000);
      setErrors({ submit: `Too many attempts. Please try again in ${minutesLeft} minutes.` });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get IP for security logging
      let ipAddress = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (ipError) {
        console.warn('Could not fetch IP address:', ipError);
      }

      // Build registration data based on user type
      const registrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone,
        userType: formData.userType,
        ipAddress,
        userAgent: navigator.userAgent,
        recaptchaToken: formData.recaptchaToken,
        acceptMarketing: formData.acceptMarketing,
        timestamp: new Date().toISOString(),
      };

      // Add type-specific fields
      switch (formData.userType) {
        case 'student':
          registrationData.educationLevel = formData.educationLevel;
          registrationData.institution = formData.institution;
          registrationData.fieldOfStudy = formData.fieldOfStudy;
          registrationData.graduationYear = formData.graduationYear;
          break;
        case 'company':
          registrationData.companyName = formData.companyName;
          registrationData.industry = formData.industry;
          registrationData.companySize = formData.companySize;
          registrationData.website = formData.website;
          break;
        case 'institute':
          registrationData.instituteName = formData.instituteName;
          registrationData.instituteType = formData.instituteType;
          registrationData.accreditation = formData.accreditation;
          registrationData.establishedYear = formData.establishedYear;
          break;
        case 'mentor':
          registrationData.title = formData.title;
          registrationData.expertise = formData.expertise;
          registrationData.yearsOfExperience = formData.yearsOfExperience;
          registrationData.hourlyRate = formData.hourlyRate;
          registrationData.bio = formData.bio;
          break;
        case 'youth':
          registrationData.businessName = formData.businessName;
          registrationData.businessStage = formData.businessStage;
          registrationData.businessIndustry = formData.businessIndustry;
          registrationData.businessDescription = formData.businessDescription;
          break;
        case 'entrepreneur':
          registrationData.companyName = formData.entrepreneurCompanyName;
          registrationData.industry = formData.entrepreneurIndustry;
          registrationData.businessStage = formData.businessStage;
          registrationData.teamSize = formData.teamSize;
          registrationData.fundingStage = formData.fundingStage;
          registrationData.lookingForInvestment = formData.lookingForInvestment;
          registrationData.lookingForMentors = formData.lookingForMentors;
          break;
      }

      console.log('Submitting registration with data:', {
        ...registrationData,
        password: '[REDACTED]',
      });

      const registerResult = await authRegister(registrationData);

      if (!registerResult.success) {
        setAttemptCount((prev) => prev + 1);
        setLastAttemptTime(now);
        throw new Error(registerResult.error || 'Registration failed');
      }

      // Reset attempts on success
      setAttemptCount(0);
      setRegistrationSuccess(true);

      // Show verification modal
      setShowVerificationModal(true);

      // Start countdown for resend
      setCountdown(60);
      setResendEnabled(false);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
      recaptchaRef.current?.reset();
      setFormData((prev) => ({ ...prev, recaptchaToken: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email code
  const handleVerifyEmail = async () => {
    if (!formData.email || !formData.password) {
      setVerificationError('Missing account credentials. Please register again.');
      return;
    }

    // Rate limiting for verification attempts
    const now = Date.now();
    if (now - lastAttemptTime < 2000) {
      setVerificationError('Please wait before trying again');
      return;
    }
    setLastAttemptTime(now);

    setVerificationLoading(true);
    setVerificationError('');

    try {
      const result = await verifyEmail(formData.email, formData.password);

      if (result.success) {
        setShowVerificationModal(false);

        const dashboardPath = getDashboardPathByUserType(result.userType || formData.userType);

        navigate(dashboardPath, {
          state: {
            message: 'Email verified successfully! Welcome to Career Connect.',
            type: 'success',
          },
        });
      } else {
        setVerificationError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Resend verification code
  const handleResendVerification = async () => {
    if (!resendEnabled) return;

    setResendLoading(true);
    setVerificationError('');

    try {
      const result = await resendVerification(formData.email, formData.password);

      if (result.success) {
        setCountdown(60);
        setResendEnabled(false);
        setVerificationCode(['', '', '', '', '', '']);
        verificationInputs.current[0]?.focus();
      } else {
        setVerificationError(result.error || 'Failed to resend code');
      }
    } catch (error) {
      setVerificationError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Handle verification code input
  const handleVerificationChange = (index, value) => {
    if (value && !/^.+$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setVerificationError('');

    if (value && index < 5) {
      verificationInputs.current[index + 1]?.focus();
    }
  };

  const handleVerificationKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      verificationInputs.current[index - 1]?.focus();
    }
  };

  // Handle recaptcha
  const handleRecaptcha = (token) => {
    setFormData((prev) => ({ ...prev, recaptchaToken: token }));
  };

  // Get password strength indicators
  const getPasswordStrengthColor = () => {
    if (passwordStrength.score >= 8) return 'success';
    if (passwordStrength.score >= 5) return 'warning';
    return 'danger';
  };

  // Render step 2 (common for all user types)
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* User Type Badge */}
      <div className="text-center mb-4">
        <Badge
          bg="primary"
          className="px-4 py-2 rounded-pill"
          style={{ background: currentUserType.color }}
        >
          <span className="me-2">{currentUserType.icon}</span>
          Signing up as: {currentUserType.label}
        </Badge>
      </div>

      {/* Google Sign-up */}
      <Button
        variant="outline-dark"
        size="lg"
        className="w-100 py-3 fw-semibold mb-4 google-btn"
        onClick={handleGoogleRegistration}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Connecting with Google...
          </>
        ) : (
          <>
            <FaGoogle className="me-2" />
            Sign up with Google as {currentUserType.label}
          </>
        )}
      </Button>

      <div className="position-relative text-center mb-4">
        <hr className="text-muted" />
        <span className="px-3 bg-white text-muted small position-absolute top-50 start-50 translate-middle">
          or continue with email
        </span>
      </div>

      {/* Email/Password Form */}
      <>
        {/* Full Name */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            <FaUser className="me-2 text-primary" />
            Full Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
            isInvalid={!!errors.fullName}
            placeholder="Enter your full name"
            disabled={isLoading}
            size="lg"
          />
          <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
        </Form.Group>

        {/* Email */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            <FaEnvelope className="me-2 text-primary" />
            Email Address <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            isInvalid={!!errors.email}
            placeholder="your@email.com"
            disabled={isLoading}
            size="lg"
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        {/* Phone (Optional) */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            <FaPhone className="me-2 text-primary" />
            Phone Number <span className="text-muted">(Optional)</span>
          </Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1234567890"
            disabled={isLoading}
            size="lg"
          />
        </Form.Group>

        {/* Password */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            <FaLock className="me-2 text-primary" />
            Password <span className="text-danger">*</span>
          </Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              isInvalid={!!errors.password}
              placeholder="Create a strong password"
              disabled={isLoading}
              size="lg"
              className="pe-5"
            />
            <Button
              variant="link"
              className="position-absolute end-0 top-50 translate-middle-y text-muted password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </div>

          {formData.password && (
            <div className="mt-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">Strength:</small>
                <small className={`text-${getPasswordStrengthColor()} fw-bold`}>
                  {passwordStrength.label}
                </small>
              </div>
              <ProgressBar
                now={(passwordStrength.score / 10) * 100}
                variant={getPasswordStrengthColor()}
                className="password-strength-bar"
                style={{ height: '6px' }}
              />
            </div>
          )}

          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
        </Form.Group>

        {/* Confirm Password */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">
            <FaCheckDouble className="me-2 text-primary" />
            Confirm Password <span className="text-danger">*</span>
          </Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              isInvalid={!!errors.confirmPassword}
              placeholder="Confirm your password"
              disabled={isLoading}
              size="lg"
              className="pe-5"
            />
            <Button
              variant="link"
              className="position-absolute end-0 top-50 translate-middle-y text-muted password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </div>
          <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            size="lg"
            className="px-4"
            onClick={() => setCurrentStep(1)}
          >
            <FaArrowLeft className="me-2" /> Back
          </Button>

          <Button
            variant="primary"
            size="lg"
            className="px-5 fw-semibold"
            onClick={nextStep}
            disabled={Object.keys(errors).length > 0 || !formData.password || !formData.email}
          >
            Next: {currentUserType.steps[2]} <FaArrowRight className="ms-2" />
          </Button>
        </div>
      </>
    </motion.div>
  );

  // Render step 3 based on user type
  const renderStep3 = () => {
    switch (formData.userType) {
      case 'student':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-2">
                <FaGraduationCap className="me-2 text-primary" />
                Tell us about your education
              </h5>
              <p className="text-muted small">
                This helps us match you with relevant opportunities
              </p>
            </div>

            {/* Education Level */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Education Level <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                isInvalid={!!errors.educationLevel}
                size="lg"
              >
                <option value="">Select your education level</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.educationLevel}</Form.Control.Feedback>
            </Form.Group>

            {/* Institution */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Institution / University <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                isInvalid={!!errors.institution}
                placeholder="e.g., University of Nairobi"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">{errors.institution}</Form.Control.Feedback>
            </Form.Group>

            {/* Field of Study */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Field of Study <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                size="lg"
              />
            </Form.Group>

            {/* Graduation Year */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Expected Graduation Year <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="e.g., 2025"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
                size="lg"
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" size="lg" className="px-4" onClick={prevStep}>
                <FaArrowLeft className="me-2" /> Back
              </Button>
              <Button variant="primary" size="lg" className="px-5 fw-semibold" onClick={nextStep}>
                Continue to Review <FaArrowRight className="ms-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'company':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-2">
                <FaBuilding className="me-2 text-primary" />
                Tell us about your company
              </h5>
              <p className="text-muted small">
                This information helps us personalize your experience
              </p>
            </div>

            {/* Company Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Company Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                isInvalid={!!errors.companyName}
                placeholder="Enter your company name"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">{errors.companyName}</Form.Control.Feedback>
            </Form.Group>

            {/* Industry */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Industry <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                isInvalid={!!errors.industry}
                size="lg"
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.industry}</Form.Control.Feedback>
            </Form.Group>

            {/* Company Size */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Company Size <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                size="lg"
              >
                <option value="">Select company size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Website */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Website <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                isInvalid={!!errors.website}
                placeholder="https://www.example.com"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">{errors.website}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" size="lg" className="px-4" onClick={prevStep}>
                <FaArrowLeft className="me-2" /> Back
              </Button>
              <Button variant="primary" size="lg" className="px-5 fw-semibold" onClick={nextStep}>
                Continue to Review <FaArrowRight className="ms-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'institute':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-2">
                <FaUniversity className="me-2 text-primary" />
                Institute Details
              </h5>
              <p className="text-muted small">Tell us about your educational institution</p>
            </div>

            {/* Institute Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Institute Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="instituteName"
                value={formData.instituteName}
                onChange={handleChange}
                isInvalid={!!errors.instituteName}
                placeholder="Enter institute name"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">{errors.instituteName}</Form.Control.Feedback>
            </Form.Group>

            {/* Institute Type */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Institute Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="instituteType"
                value={formData.instituteType}
                onChange={handleChange}
                isInvalid={!!errors.instituteType}
                size="lg"
              >
                <option value="">Select type</option>
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="vocational">Vocational/Training Center</option>
                <option value="highschool">High School</option>
                <option value="other">Other</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.instituteType}</Form.Control.Feedback>
            </Form.Group>

            {/* Accreditation */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Accreditation <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="accreditation"
                value={formData.accreditation}
                onChange={handleChange}
                placeholder="e.g., National Commission for Universities"
                size="lg"
              />
            </Form.Group>

            {/* Established Year */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Year Established <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleChange}
                placeholder="e.g., 2000"
                min={1800}
                max={new Date().getFullYear()}
                size="lg"
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" size="lg" className="px-4" onClick={prevStep}>
                <FaArrowLeft className="me-2" /> Back
              </Button>
              <Button variant="primary" size="lg" className="px-5 fw-semibold" onClick={nextStep}>
                Continue to Review <FaArrowRight className="ms-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'mentor':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-2">
                <FaChalkboardTeacher className="me-2 text-primary" />
                Professional Details
              </h5>
              <p className="text-muted small">Tell us about your expertise and experience</p>
            </div>

            {/* Professional Title */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Professional Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                isInvalid={!!errors.title}
                placeholder="e.g., Senior Software Engineer, Career Coach"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
            </Form.Group>

            {/* Expertise Areas */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Areas of Expertise <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="expertise"
                value={formData.expertise}
                onChange={handleExpertiseChange}
                isInvalid={!!errors.expertise}
                multiple
                size="lg"
                style={{ height: '150px' }}
              >
                {EXPERTISE_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">Hold Ctrl/Cmd to select multiple areas</Form.Text>
              <Form.Control.Feedback type="invalid">{errors.expertise}</Form.Control.Feedback>
            </Form.Group>

            {/* Years of Experience */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Years of Experience <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                isInvalid={!!errors.yearsOfExperience}
                placeholder="e.g., 5"
                min={0}
                max={50}
                size="lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.yearsOfExperience}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Hourly Rate */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Hourly Rate (USD) <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="e.g., 50"
                min={0}
                size="lg"
              />
            </Form.Group>

            {/* Bio */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Professional Bio <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about your background and what you can offer as a mentor"
                rows={4}
                size="lg"
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" size="lg" className="px-4" onClick={prevStep}>
                <FaArrowLeft className="me-2" /> Back
              </Button>
              <Button variant="primary" size="lg" className="px-5 fw-semibold" onClick={nextStep}>
                Continue to Review <FaArrowRight className="ms-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'youth':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-2">
                <FaRocket className="me-2 text-primary" />
                Your Business Idea
              </h5>
              <p className="text-muted small">Tell us about your entrepreneurial journey</p>
            </div>

            {/* Business Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Business / Idea Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                isInvalid={!!errors.businessName}
                placeholder="Enter your business or idea name"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">{errors.businessName}</Form.Control.Feedback>
            </Form.Group>

            {/* Business Stage */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Current Stage <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="businessStage"
                value={formData.businessStage}
                onChange={handleChange}
                isInvalid={!!errors.businessStage}
                size="lg"
              >
                <option value="">Select current stage</option>
                {BUSINESS_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.businessStage}</Form.Control.Feedback>
            </Form.Group>

            {/* Industry */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Industry <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="businessIndustry"
                value={formData.businessIndustry}
                onChange={handleChange}
                isInvalid={!!errors.businessIndustry}
                size="lg"
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.businessIndustry}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Business Description */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Business Description <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                placeholder="Briefly describe your business idea or startup"
                rows={4}
                size="lg"
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" size="lg" className="px-4" onClick={prevStep}>
                <FaArrowLeft className="me-2" /> Back
              </Button>
              <Button variant="primary" size="lg" className="px-5 fw-semibold" onClick={nextStep}>
                Continue to Review <FaArrowRight className="ms-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'entrepreneur':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4">
              <h5 className="fw-bold mb-2">
                <FaUserTie className="me-2 text-primary" />
                Business Details
              </h5>
              <p className="text-muted small">Tell us about your established business</p>
            </div>

            {/* Company Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Company Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="entrepreneurCompanyName"
                value={formData.entrepreneurCompanyName}
                onChange={handleChange}
                isInvalid={!!errors.entrepreneurCompanyName}
                placeholder="Enter your company name"
                size="lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.entrepreneurCompanyName}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Industry */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Industry <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="entrepreneurIndustry"
                value={formData.entrepreneurIndustry}
                onChange={handleChange}
                isInvalid={!!errors.entrepreneurIndustry}
                size="lg"
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.entrepreneurIndustry}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Business Stage */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Business Stage <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="businessStage"
                value={formData.businessStage}
                onChange={handleChange}
                isInvalid={!!errors.businessStage}
                size="lg"
              >
                <option value="">Select business stage</option>
                {BUSINESS_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.businessStage}</Form.Control.Feedback>
            </Form.Group>

            {/* Team Size */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Team Size <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Select
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                size="lg"
              >
                <option value="">Select team size</option>
                <option value="1">Solo Founder</option>
                <option value="2-5">2-5 people</option>
                <option value="6-10">6-10 people</option>
                <option value="11-20">11-20 people</option>
                <option value="21-50">21-50 people</option>
                <option value="51+">51+ people</option>
              </Form.Select>
            </Form.Group>

            {/* Funding Stage */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Funding Stage <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Select
                name="fundingStage"
                value={formData.fundingStage}
                onChange={handleChange}
                size="lg"
              >
                <option value="">Select funding stage</option>
                <option value="bootstrapped">Bootstrapped</option>
                <option value="pre-seed">Pre-seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B</option>
                <option value="series-c">Series C+</option>
              </Form.Select>
            </Form.Group>

            {/* Looking for Investment */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="lookingForInvestment"
                checked={formData.lookingForInvestment}
                onChange={handleChange}
                label="I'm looking for investment"
              />
            </Form.Group>

            {/* Looking for Mentors */}
            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="lookingForMentors"
                checked={formData.lookingForMentors}
                onChange={handleChange}
                label="I'm looking for mentors/advisors"
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" size="lg" className="px-4" onClick={prevStep}>
                <FaArrowLeft className="me-2" /> Back
              </Button>
              <Button variant="primary" size="lg" className="px-5 fw-semibold" onClick={nextStep}>
                Continue to Review <FaArrowRight className="ms-2" />
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Render final review step
  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* User Type Summary */}
      <div className="text-center mb-4">
        <Badge
          bg="primary"
          className="px-4 py-2 rounded-pill"
          style={{ background: currentUserType.color }}
        >
          <span className="me-2">{currentUserType.icon}</span>
          {currentUserType.label} Account
        </Badge>
      </div>

      {/* Review Summary */}
      <Card className="bg-light border-0 mb-4">
        <Card.Body>
          <h6 className="fw-bold mb-3">Review Your Information</h6>

          <div className="mb-3">
            <div className="row">
              <div className="col-5">
                <small className="text-muted">Full Name:</small>
              </div>
              <div className="col-7">
                <p className="fw-semibold mb-2">{formData.fullName}</p>
              </div>
            </div>

            <div className="row">
              <div className="col-5">
                <small className="text-muted">Email:</small>
              </div>
              <div className="col-7">
                <p className="fw-semibold mb-2">{formData.email}</p>
              </div>
            </div>

            {formData.phone && (
              <div className="row">
                <div className="col-5">
                  <small className="text-muted">Phone:</small>
                </div>
                <div className="col-7">
                  <p className="fw-semibold mb-2">{formData.phone}</p>
                </div>
              </div>
            )}

            {/* Type-specific review */}
            {formData.userType === 'student' && (
              <>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Education Level:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.educationLevel || 'Not provided'}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Institution:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.institution || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}

            {formData.userType === 'company' && (
              <>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Company Name:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.companyName || 'Not provided'}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Industry:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.industry || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}

            {formData.userType === 'institute' && (
              <>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Institute Name:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.instituteName || 'Not provided'}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Institute Type:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.instituteType || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}

            {formData.userType === 'mentor' && (
              <>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Professional Title:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.title || 'Not provided'}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Expertise:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">
                      {formData.expertise?.join(', ') || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Experience:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">
                      {formData.yearsOfExperience
                        ? `${formData.yearsOfExperience} years`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {formData.userType === 'youth' && (
              <>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Business Name:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.businessName || 'Not provided'}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Stage:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.businessStage || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}

            {formData.userType === 'entrepreneur' && (
              <>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Company Name:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">
                      {formData.entrepreneurCompanyName || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Industry:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">
                      {formData.entrepreneurIndustry || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-5">
                    <small className="text-muted">Stage:</small>
                  </div>
                  <div className="col-7">
                    <p className="fw-semibold mb-2">{formData.businessStage || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Approval Notice for accounts requiring approval */}
      {currentUserType.requiresApproval && (
        <Alert variant="info" className="mb-4">
          <FaInfoCircle className="me-2" />
          Your account will be reviewed by our team. You'll receive an email once approved.
        </Alert>
      )}

      {/* reCAPTCHA */}
      <div className="mb-4 d-flex justify-content-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={
            import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
          }
          onChange={handleRecaptcha}
        />
      </div>

      {/* Terms and Marketing */}
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleChange}
          isInvalid={!!errors.acceptTerms}
          label={
            <span className="small">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-decoration-none">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-decoration-none">
                Privacy Policy
              </a>{' '}
              <span className="text-danger">*</span>
            </span>
          }
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Check
          type="checkbox"
          name="acceptMarketing"
          checked={formData.acceptMarketing}
          onChange={handleChange}
          label={
            <span className="small text-muted">
              I'd like to receive career tips, job alerts, and platform updates (optional)
            </span>
          }
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" size="lg" className="px-4" onClick={prevStep}>
          <FaArrowLeft className="me-2" /> Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          type="submit"
          disabled={isLoading || !formData.acceptTerms || !formData.recaptchaToken}
          className="px-5 fw-semibold"
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Creating Account...
            </>
          ) : (
            <>
              <FaRocket className="me-2" />
              Create {currentUserType.label} Account
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="register-container min-vh-100 d-flex align-items-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <Card className="border-0 shadow-lg overflow-hidden register-card">
                <Card.Body className="p-4 p-lg-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h2 className="fw-bold text-dark mb-2">Create Your Account</h2>
                    <p className="text-muted">
                      {currentStep === 1 && 'Choose your account type'}
                      {currentStep > 1 && currentUserType?.steps[currentStep - 1]}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  {formData.userType && currentStep > 1 && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        {currentUserType.steps.map((step, index) => (
                          <Badge
                            key={step}
                            bg={currentStep >= index + 1 ? 'primary' : 'light'}
                            className={`px-3 py-2 step-badge ${currentStep >= index + 1 ? 'active-step' : ''}`}
                            style={
                              currentStep >= index + 1 ? { background: currentUserType.color } : {}
                            }
                          >
                            {index + 1}. {step}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success/Error Messages */}
                  {errors.submit && (
                    <Alert variant="danger" className="d-flex align-items-center border-0 mb-4">
                      <FaExclamationTriangle className="me-2 flex-shrink-0" size={20} />
                      <div>{errors.submit}</div>
                    </Alert>
                  )}

                  {/* Registration Success Message */}
                  {registrationSuccess && !showVerificationModal && (
                    <Alert variant="success" className="mb-4">
                      <FaCheckCircle className="me-2" />
                      Registration successful! Please check your email to verify your account.
                    </Alert>
                  )}

                  {/* Form */}
                  <Form onSubmit={handleManualRegistration}>
                    {/* Step 1: User Type Selection */}
                    {currentStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Row className="g-4 mb-4">
                          {USER_TYPES.map((type) => (
                            <Col md={6} key={type.value}>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <div
                                  className={`p-4 rounded-4 border cursor-pointer account-type-card h-100 ${
                                    formData.userType === type.value ? 'selected' : ''
                                  }`}
                                  onClick={() => handleUserTypeSelect(type.value)}
                                  style={{
                                    borderColor:
                                      formData.userType === type.value ? type.color : '#dee2e6',
                                    background:
                                      formData.userType === type.value
                                        ? `${type.color}10`
                                        : 'white',
                                  }}
                                >
                                  <div className="text-center mb-3">
                                    <div
                                      className="type-icon-wrapper mb-3 mx-auto"
                                      style={{
                                        background: type.gradient,
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                      }}
                                    >
                                      {type.icon}
                                    </div>
                                    <h4 className="fw-bold mb-2">{type.label}</h4>
                                    <p className="text-muted small mb-3">{type.description}</p>
                                  </div>
                                  <div className="benefits-list">
                                    {type.benefits.map((benefit, idx) => (
                                      <div key={idx} className="d-flex align-items-center mb-2">
                                        <FaCheckCircle
                                          className="text-success me-2 flex-shrink-0"
                                          size={14}
                                        />
                                        <small>{benefit}</small>
                                      </div>
                                    ))}
                                  </div>
                                  {type.requiresApproval && (
                                    <div className="mt-2">
                                      <Badge bg="warning" text="dark" className="w-100">
                                        <FaShieldAlt className="me-1" />
                                        Requires Approval
                                      </Badge>
                                    </div>
                                  )}
                                  {formData.userType === type.value && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="position-absolute top-0 end-0 mt-3 me-3"
                                    >
                                      <FaCheckCircle size={24} className="text-primary" />
                                    </motion.div>
                                  )}
                                </div>
                              </motion.div>
                            </Col>
                          ))}
                        </Row>

                        {errors.userType && (
                          <Form.Text className="text-danger d-block text-center mb-3">
                            <FaExclamationTriangle className="me-1" />
                            {errors.userType}
                          </Form.Text>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Common Information */}
                    {currentStep === 2 && renderStep2()}

                    {/* Step 3: Type-specific Information */}
                    {currentStep === 3 && renderStep3()}

                    {/* Final Step: Review & Verify */}
                    {currentStep === 4 && renderReviewStep()}

                    {/* Login Link */}
                    <div className="text-center pt-4 mt-4 border-top">
                      <p className="text-muted small mb-0">
                        Already have an account?{' '}
                        <Link to="/login" className="text-decoration-none fw-semibold">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Email Verification Modal */}
      <Modal
        show={showVerificationModal}
        centered
        backdrop="static"
        keyboard={false}
        className="verification-modal"
      >
        <Modal.Body className="p-5 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <div className="verification-icon-wrapper mx-auto">
                <FaEnvelopeOpenText size={48} className="text-primary" />
              </div>
            </div>

            <h4 className="fw-bold mb-2">Verify Your Email</h4>
            <p className="text-muted mb-4">
              We've sent a 6-digit verification code to
              <br />
              <strong className="text-dark">{formData.email}</strong>
            </p>

            {/* Verification Code Input */}
            <div className="d-flex justify-content-center gap-2 mb-4">
              {verificationCode.map((digit, index) => (
                <Form.Control
                  key={index}
                  ref={(el) => (verificationInputs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleVerificationChange(index, e.target.value)}
                  onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                  className="text-center verification-input"
                  style={{ width: '50px', height: '60px', fontSize: '24px' }}
                  disabled={verificationLoading}
                />
              ))}
            </div>

            {verificationError && (
              <Alert variant="danger" className="mb-3">
                <FaExclamationTriangle className="me-2" />
                {verificationError}
              </Alert>
            )}

            {/* Timer and Resend */}
            <div className="d-flex align-items-center justify-content-center mb-4">
              <FaClock className="me-2 text-muted" />
              <small className="text-muted">
                {resendEnabled ? (
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Sending...' : 'Resend code'}
                  </Button>
                ) : (
                  `Resend available in ${countdown}s`
                )}
              </small>
            </div>

            {/* Verify Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-100 py-3 fw-semibold mb-3"
              onClick={handleVerifyEmail}
              disabled={verificationCode.join('').length !== 6 || verificationLoading}
            >
              {verificationLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email <FaCheckCircle className="ms-2" />
                </>
              )}
            </Button>

            {/* Security Note */}
            <p className="small text-muted mb-0">
              <FaShieldAlt className="me-1" />
              This code expires in 10 minutes for security
            </p>
          </motion.div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Register;
