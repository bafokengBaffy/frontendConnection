import React, { useState, useEffect, useRef } from 'react';
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
  OverlayTrigger,
  Tooltip,
  Badge,
  ProgressBar,
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validation } from '../../utils/validation';
import {
  FaGoogle,
  FaGraduationCap,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaUser,
  FaCheckCircle,
  FaInfoCircle,
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
  FaBan,
  FaBuilding as FaCompany,
  FaStore,
  FaSuitcase,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import './Registration.css';

const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialUserType = queryParams.get('type') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: initialUserType || '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    phone: '',
    acceptTerms: false,
    acceptMarketing: false,
    recaptchaToken: '',
  });

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
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

  const { register: authRegister, loginWithGoogle, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef();
  const verificationInputs = useRef([]);

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
      const validationResult = validation.password(formData.password);
      setPasswordStrength({
        score: validationResult.strength,
        feedback: validationResult.errors,
        isValid: validationResult.isValid,
      });
    }
  }, [formData.password]);

  // Handle user type selection
  const handleUserTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, userType: type }));
    setErrors((prev) => ({ ...prev, userType: '' }));
    setCurrentStep(2); // Move to step 2 immediately after selection
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setTouched((prev) => ({ ...prev, [name]: true }));

    // Real-time validation for specific fields
    if (['email', 'fullName', 'companyName', 'phone', 'website', 'industry'].includes(name)) {
      validateField(name, value);
    }
  };

  // Validate single field
  const validateField = (name, value) => {
    let fieldErrors = { ...errors };

    switch (name) {
      case 'email':
        if (touched.email) {
          const emailValid = validation.email(value);
          if (!emailValid.isValid) {
            fieldErrors.email = emailValid.errors[0];
          } else {
            delete fieldErrors.email;
          }
        }
        break;

      case 'fullName':
        const nameValid = validation.name(value);
        if (!nameValid.isValid && touched.fullName) {
          fieldErrors.fullName = nameValid.errors[0];
        } else {
          delete fieldErrors.fullName;
        }
        break;

      case 'companyName':
        const companyValid = validation.companyName(value);
        if (!companyValid.isValid && touched.companyName) {
          fieldErrors.companyName = companyValid.errors[0];
        } else {
          delete fieldErrors.companyName;
        }
        break;

      case 'password':
        if (touched.password && !passwordStrength.isValid) {
          fieldErrors.password = passwordStrength.feedback[0];
        } else {
          delete fieldErrors.password;
        }
        break;

      case 'confirmPassword':
        if (touched.confirmPassword && value !== formData.password) {
          fieldErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete fieldErrors.confirmPassword;
        }
        break;
    }

    setErrors(fieldErrors);
  };

  // Step validation
  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 2) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }

      if (!formData.email) {
        newErrors.email = 'Email address is required';
      } else {
        const emailValid = validation.email(formData.email);
        if (!emailValid.isValid) {
          newErrors.email = emailValid.errors[0];
        }
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!passwordStrength.isValid) {
        newErrors.password = passwordStrength.feedback[0];
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (currentStep === 3 && formData.userType === 'company') {
      if (!formData.companyName) {
        newErrors.companyName = 'Company name is required';
      }

      if (!formData.industry) {
        newErrors.industry = 'Industry is required';
      }

      if (formData.website) {
        const websiteValid = validation.website(formData.website);
        if (!websiteValid.isValid) {
          newErrors.website = websiteValid.errors[0];
        }
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

  // Google Registration - FIXED: Properly passes user type
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
        ...(formData.userType === 'company' && {
          companyName: formData.companyName || undefined,
          industry: formData.industry || undefined,
          companySize: formData.companySize || undefined,
          website: formData.website || undefined,
          phone: formData.phone || undefined,
        }),
      };

      const result = await loginWithGoogle(registrationData);

      if (!result.success) {
        setAttemptCount((prev) => prev + 1);
        setLastAttemptTime(now);
        throw new Error(result.error || 'Google registration failed');
      }

      // Reset attempts on success
      setAttemptCount(0);

      // Success - redirect based on user type
      const dashboardPath =
        formData.userType === 'company' ? '/company/dashboard' : '/student/dashboard';
      navigate(dashboardPath, {
        state: {
          message: `Welcome to Career Connect! Your ${formData.userType} account has been created successfully.`,
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

  // Manual Registration - FIXED: Properly structures data for students vs companies
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
        userType: formData.userType,
        ipAddress,
        userAgent: navigator.userAgent,
        recaptchaToken: formData.recaptchaToken,
        acceptMarketing: formData.acceptMarketing,
        timestamp: new Date().toISOString(),
      };

      // Add company-specific fields ONLY if user is a company
      if (formData.userType === 'company') {
        registrationData.companyName = formData.companyName?.trim();
        registrationData.industry = formData.industry;
        registrationData.companySize = formData.companySize;
        registrationData.website = formData.website?.trim();
        registrationData.phone = formData.phone?.trim();
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
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setVerificationError('Please enter the complete 6-digit code');
      return;
    }

    // Rate limiting for verification attempts
    const now = Date.now();
    if (now - lastAttemptTime < 2000) {
      // 2 seconds between attempts
      setVerificationError('Please wait before trying again');
      return;
    }
    setLastAttemptTime(now);

    setVerificationLoading(true);
    setVerificationError('');

    try {
      const result = await verifyEmail(formData.email, code);

      if (result.success) {
        setShowVerificationModal(false);

        // Auto-login the user
        const dashboardPath =
          formData.userType === 'company' ? '/company/dashboard' : '/student/dashboard';
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
      const result = await resendVerification(formData.email);

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
    if (value && !/^\d+$/.test(value)) return;

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
    if (passwordStrength.score >= 6) return 'info';
    if (passwordStrength.score >= 4) return 'warning';
    return 'danger';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score >= 8) return 'Very Strong';
    if (passwordStrength.score >= 6) return 'Strong';
    if (passwordStrength.score >= 4) return 'Fair';
    if (passwordStrength.score >= 2) return 'Weak';
    return 'Very Weak';
  };

  const userTypes = [
    {
      value: 'student',
      label: 'Student / Graduate',
      description: 'Find internships, jobs, and launch your career',
      icon: <FaGraduationCap className="display-4" />,
      gradient: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
      benefits: [
        'Quick sign-up with Google',
        'AI-powered job matching',
        'Free career resources',
        'Network with employers',
      ],
      color: '#4158D0',
    },
    {
      value: 'company',
      label: 'Company / Employer',
      description: 'Hire talent, post jobs, and build your team',
      icon: <FaBuilding className="display-4" />,
      gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
      benefits: [
        'Sign up with Google or Email',
        'Smart candidate screening',
        'Analytics dashboard',
        'Verified employer badge',
      ],
      color: '#0093E9',
    },
  ];

  const industries = [
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

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees',
  ];

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
                      {currentStep === 1 && 'Choose how you want to join Career Connect'}
                      {currentStep === 2 &&
                        formData.userType === 'student' &&
                        'Sign up as a Student'}
                      {currentStep === 2 &&
                        formData.userType === 'company' &&
                        'Create Company Account'}
                      {currentStep === 3 &&
                        formData.userType === 'company' &&
                        'Complete Your Company Profile'}
                      {((currentStep === 3 && formData.userType === 'student') ||
                        (currentStep === 4 && formData.userType === 'company')) &&
                        'Review & Verify'}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  {formData.userType && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <Badge
                          bg={currentStep >= 1 ? 'primary' : 'light'}
                          className={`px-3 py-2 step-badge ${currentStep >= 1 ? 'active-step' : ''}`}
                        >
                          1. Account Type
                        </Badge>
                        <Badge
                          bg={currentStep >= 2 ? 'primary' : 'light'}
                          className={`px-3 py-2 step-badge ${currentStep >= 2 ? 'active-step' : ''}`}
                        >
                          2. {formData.userType === 'company' ? 'Basic Info' : 'Credentials'}
                        </Badge>
                        {formData.userType === 'company' && (
                          <Badge
                            bg={currentStep >= 3 ? 'primary' : 'light'}
                            className={`px-3 py-2 step-badge ${currentStep >= 3 ? 'active-step' : ''}`}
                          >
                            3. Company Details
                          </Badge>
                        )}
                        <Badge
                          bg={
                            currentStep >= (formData.userType === 'company' ? 4 : 3)
                              ? 'primary'
                              : 'light'
                          }
                          className={`px-3 py-2 step-badge ${currentStep >= (formData.userType === 'company' ? 4 : 3) ? 'active-step' : ''}`}
                        >
                          {formData.userType === 'company' ? 4 : 3}. Verify
                        </Badge>
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
                          {userTypes.map((type) => (
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

                    {/* Step 2: Account Creation - For BOTH students and companies */}
                    {currentStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        {/* User Type Badge */}
                        <div className="text-center mb-4">
                          <Badge
                            bg={formData.userType === 'company' ? 'info' : 'primary'}
                            className="px-4 py-2 rounded-pill"
                          >
                            {formData.userType === 'company' ? (
                              <FaBuilding className="me-2" />
                            ) : (
                              <FaGraduationCap className="me-2" />
                            )}
                            Signing up as: {formData.userType === 'company' ? 'Company' : 'Student'}
                          </Badge>
                        </div>

                        {/* Google Sign-up - Available for BOTH */}
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
                              Sign up with Google as{' '}
                              {formData.userType === 'student' ? 'a Student' : 'a Company'}
                            </>
                          )}
                        </Button>

                        <div className="position-relative text-center mb-4">
                          <hr className="text-muted" />
                          <span className="px-3 bg-white text-muted small position-absolute top-50 start-50 translate-middle">
                            or continue with email
                          </span>
                        </div>

                        {/* Email/Password Form - For both students and companies */}
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
                            <Form.Control.Feedback type="invalid">
                              {errors.fullName}
                            </Form.Control.Feedback>
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
                            <Form.Control.Feedback type="invalid">
                              {errors.email}
                            </Form.Control.Feedback>
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
                                    {getPasswordStrengthText()}
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

                            <Form.Control.Feedback type="invalid">
                              {errors.password}
                            </Form.Control.Feedback>
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
                                onBlur={() =>
                                  setTouched((prev) => ({ ...prev, confirmPassword: true }))
                                }
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
                            <Form.Control.Feedback type="invalid">
                              {errors.confirmPassword}
                            </Form.Control.Feedback>
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

                            {/* Different next step behavior for students vs companies */}
                            {formData.userType === 'company' ? (
                              <Button
                                variant="primary"
                                size="lg"
                                className="px-5 fw-semibold"
                                onClick={nextStep}
                                disabled={
                                  Object.keys(errors).length > 0 ||
                                  !formData.password ||
                                  !formData.email
                                }
                              >
                                Next: Company Details <FaArrowRight className="ms-2" />
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="lg"
                                className="px-5 fw-semibold"
                                onClick={nextStep}
                                disabled={
                                  Object.keys(errors).length > 0 ||
                                  !formData.password ||
                                  !formData.email
                                }
                              >
                                Continue to Review <FaArrowRight className="ms-2" />
                              </Button>
                            )}
                          </div>
                        </>
                      </motion.div>
                    )}

                    {/* Step 3: Company Details (Only for companies) */}
                    {currentStep === 3 && formData.userType === 'company' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="mb-4">
                          <h5 className="fw-bold mb-2">
                            <FaCompany className="me-2 text-primary" />
                            Tell us about your company
                          </h5>
                          <p className="text-muted small">
                            This information helps us personalize your experience
                          </p>
                        </div>

                        {/* Company Name */}
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <FaBuilding className="me-2 text-primary" />
                            Company Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            onBlur={() => setTouched((prev) => ({ ...prev, companyName: true }))}
                            isInvalid={!!errors.companyName}
                            placeholder="Enter your company name"
                            disabled={isLoading}
                            size="lg"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.companyName}
                          </Form.Control.Feedback>
                        </Form.Group>

                        {/* Industry */}
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <FaIndustry className="me-2 text-primary" />
                            Industry <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            onBlur={() => setTouched((prev) => ({ ...prev, industry: true }))}
                            isInvalid={!!errors.industry}
                            disabled={isLoading}
                            size="lg"
                          >
                            <option value="">Select your industry</option>
                            {industries.map((ind) => (
                              <option key={ind} value={ind}>
                                {ind}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.industry}
                          </Form.Control.Feedback>
                        </Form.Group>

                        {/* Company Size */}
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <FaUsers className="me-2 text-primary" />
                            Company Size <span className="text-muted">(Optional)</span>
                          </Form.Label>
                          <Form.Select
                            name="companySize"
                            value={formData.companySize}
                            onChange={handleChange}
                            disabled={isLoading}
                            size="lg"
                          >
                            <option value="">Select company size</option>
                            {companySizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        {/* Website */}
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            <FaGlobe className="me-2 text-primary" />
                            Website <span className="text-muted">(Optional)</span>
                          </Form.Label>
                          <Form.Control
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            onBlur={() => setTouched((prev) => ({ ...prev, website: true }))}
                            isInvalid={!!errors.website}
                            placeholder="https://www.example.com"
                            disabled={isLoading}
                            size="lg"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.website}
                          </Form.Control.Feedback>
                        </Form.Group>

                        {/* Phone */}
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">
                            <FaPhone className="me-2 text-primary" />
                            Phone Number <span className="text-muted">(Optional)</span>
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                            isInvalid={!!errors.phone}
                            placeholder="+1234567890"
                            disabled={isLoading}
                            size="lg"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.phone}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                          <Button
                            variant="outline-secondary"
                            size="lg"
                            className="px-4"
                            onClick={prevStep}
                          >
                            <FaArrowLeft className="me-2" /> Back
                          </Button>
                          <Button
                            variant="primary"
                            size="lg"
                            className="px-5 fw-semibold"
                            onClick={nextStep}
                            disabled={!!errors.companyName || !!errors.industry}
                          >
                            Continue to Review <FaArrowRight className="ms-2" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Final Step: Review & Verify */}
                    {((currentStep === 3 && formData.userType === 'student') ||
                      (currentStep === 4 && formData.userType === 'company')) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        {/* User Type Summary */}
                        <div className="text-center mb-4">
                          <Badge
                            bg={formData.userType === 'company' ? 'info' : 'primary'}
                            className="px-4 py-2 rounded-pill"
                          >
                            {formData.userType === 'company' ? (
                              <FaBuilding className="me-2" />
                            ) : (
                              <FaGraduationCap className="me-2" />
                            )}
                            {formData.userType === 'company'
                              ? 'Company Account'
                              : 'Student Account'}
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

                              {formData.userType === 'company' && (
                                <>
                                  <div className="row">
                                    <div className="col-5">
                                      <small className="text-muted">Company:</small>
                                    </div>
                                    <div className="col-7">
                                      <p className="fw-semibold mb-2">
                                        {formData.companyName || 'Not provided'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="row">
                                    <div className="col-5">
                                      <small className="text-muted">Industry:</small>
                                    </div>
                                    <div className="col-7">
                                      <p className="fw-semibold mb-2">
                                        {formData.industry || 'Not provided'}
                                      </p>
                                    </div>
                                  </div>

                                  {formData.companySize && (
                                    <div className="row">
                                      <div className="col-5">
                                        <small className="text-muted">Company Size:</small>
                                      </div>
                                      <div className="col-7">
                                        <p className="fw-semibold mb-2">{formData.companySize}</p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </Card.Body>
                        </Card>

                        {/* reCAPTCHA */}
                        <div className="mb-4 d-flex justify-content-center">
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual key
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
                                I'd like to receive career tips, job alerts, and platform updates
                                (optional)
                              </span>
                            }
                          />
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                          <Button
                            variant="outline-secondary"
                            size="lg"
                            className="px-4"
                            onClick={prevStep}
                          >
                            <FaArrowLeft className="me-2" /> Back
                          </Button>
                          <Button
                            variant="primary"
                            size="lg"
                            type="submit"
                            disabled={
                              isLoading || !formData.acceptTerms || !formData.recaptchaToken
                            }
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
                                Create {formData.userType === 'company' ? 'Company' : ''} Account
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}

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
