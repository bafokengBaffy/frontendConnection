/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  ProgressBar,
} from 'react-bootstrap';
import {
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

// ==================== CONSTANTS ====================
/**
 * Login Configuration - All magic numbers extracted to constants
 * Update these values based on your security requirements
 */
const LOGIN_CONFIG = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,

  // UI/UX timing
  FOCUS_DELAY_MS: 100,
  NAVIGATION_DELAY_MS: 100,

  // Session security
  SESSION_CHECK_INTERVAL_MS: 30000, // 30 seconds - check for hijacking
  SESSION_TIMEOUT_MS: 3600000, // 1 hour - session expires

  // Password requirements
  PASSWORD_MIN_LENGTH: 8,

  // CAPTCHA and security
  CAPTCHA_THRESHOLD_ATTEMPTS: 3, // Show CAPTCHA after 3 failed attempts
  CAPTCHA_TOOLTIP_MS: 200,
};

const ERROR_TYPES = {
  RATE_LIMITED: 'rate_limited',
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  USER_DISABLED: 'user_disabled',
  NETWORK_ERROR: 'network_error',
  GENERIC: 'generic',
  TOO_MANY_ATTEMPTS: 'too_many_attempts',
  SESSION_HIJACKED: 'session_hijacked',
  CAPTCHA_FAILED: 'captcha_failed',
  CSRF_FAILED: 'csrf_failed',
};

const LOGIN_ROLES = [
  { label: 'Student', value: 'student' },
  { label: 'Company', value: 'company' },
  { label: 'Institute', value: 'institute' },
  { label: 'Mentor', value: 'mentor' },
  { label: 'Youth', value: 'youth' },
  { label: 'Entrepreneur', value: 'entrepreneur' },
  { label: 'Parent', value: 'parent' },
  { label: 'Alumni', value: 'alumni' },
  { label: 'Admin', value: 'admin' },
];

// ==================== LOGGER UTILITY ====================
/**
 * Production logger - replaces console.error
 * In production, integrate with Sentry, LogRocket, or similar
 */
const Logger = {
  error: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Login Error] ${message}`, data);
    } else {
      // TODO: Send to external logging service
      // Example: Sentry.captureException(new Error(message), { tags: { context: 'login' }, extra: data });
    }
  },
  warn: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Login Warning] ${message}`, data);
    }
  },
  info: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[Login Info] ${message}`);
    }
  },
};

// ==================== PASSWORD STRENGTH VALIDATION ====================
/**
 * Validates password strength and returns detailed requirements
 * Used for both validation and UI feedback
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= LOGIN_CONFIG.PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const checksPassed = Object.values(checks).filter(Boolean).length;
  const strengthPercentage = (checksPassed / Object.keys(checks).length) * 100;

  return {
    checks,
    strength: Math.ceil(strengthPercentage / 25) * 25, // 0, 25, 50, 75, 100
    strengthLabel:
      strengthPercentage >= 80 ? 'Strong' : strengthPercentage >= 60 ? 'Medium' : 'Weak',
    strengthColor:
      strengthPercentage >= 80 ? 'success' : strengthPercentage >= 60 ? 'warning' : 'danger',
    isValid: checksPassed >= 4, // Require at least 4 of 5 criteria
  };
};

// ==================== COMPONENT ====================
export const Login = () => {
  const { login, loginWithGoogle, isOffline } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ==================== FORM STATE ====================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState(LOGIN_ROLES[0].value);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordOnHover, setShowPasswordOnHover] = useState(false);

  // ==================== ERROR & LOADING STATE ====================
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  // ==================== SECURITY STATE ====================
  const [csrfToken, setCsrfToken] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaCompleted, setCaptchaCompleted] = useState(false);
  const [sessionCheckWarning, setSessionCheckWarning] = useState(false);

  // ==================== PASSWORD STRENGTH ====================
  const [passwordStrength, setPasswordStrength] = useState({
    checks: {},
    strength: 0,
    strengthLabel: 'Weak',
    strengthColor: 'danger',
    isValid: false,
  });

  // ==================== REFS ====================
  const formRef = useRef(null);
  const lockoutTimerRef = useRef(null);
  const passwordToggleRef = useRef(null);
  const errorAlertRef = useRef(null);
  const submissionInProgressRef = useRef(false);
  const sessionCheckTimerRef = useRef(null);
  const initialSessionIdRef = useRef(null);

  // ==================== UTILITY FUNCTIONS ====================
  /**
   * Generates a unique session ID for hijacking detection
   */
  const generateSessionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Fetches CSRF token from backend
   */
  const initializeSecurityTokens = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.token);
      }
    } catch (err) {
      Logger.warn('Failed to fetch CSRF token', err);
      // Continue without CSRF token - backend should handle gracefully
    }
  }, []);

  /**
   * Validates email format
   */
  const validateEmail = useCallback((value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return emailPattern.test(value);
  }, []);

  /**
   * Maps backend error messages to specific error types for targeted UI/UX
   */
  const mapErrorToType = useCallback((errorMessage) => {
    if (!errorMessage) return ERROR_TYPES.GENERIC;

    const lowerMsg = errorMessage.toLowerCase();

    if (lowerMsg.includes('captcha')) {
      return ERROR_TYPES.CAPTCHA_FAILED;
    }
    if (lowerMsg.includes('csrf')) {
      return ERROR_TYPES.CSRF_FAILED;
    }
    if (
      lowerMsg.includes('too many') ||
      lowerMsg.includes('rate limit') ||
      lowerMsg.includes('lockout') ||
      lowerMsg.includes('try again in')
    ) {
      return ERROR_TYPES.RATE_LIMITED;
    }
    if (lowerMsg.includes('verify') || lowerMsg.includes('verification')) {
      return ERROR_TYPES.EMAIL_NOT_VERIFIED;
    }
    if (
      lowerMsg.includes('invalid credential') ||
      lowerMsg.includes('wrong password') ||
      lowerMsg.includes('user not found')
    ) {
      return ERROR_TYPES.INVALID_CREDENTIALS;
    }
    if (lowerMsg.includes('disabled')) {
      return ERROR_TYPES.USER_DISABLED;
    }
    if (lowerMsg.includes('network') || lowerMsg.includes('offline')) {
      return ERROR_TYPES.NETWORK_ERROR;
    }
    if (lowerMsg.includes('session') || lowerMsg.includes('hijack')) {
      return ERROR_TYPES.SESSION_HIJACKED;
    }

    return ERROR_TYPES.GENERIC;
  }, []);

  /**
   * Executes reCAPTCHA v3 for bot detection
   */
  const executeCaptcha = useCallback(async () => {
    try {
      if (!window.grecaptcha) {
        Logger.warn('reCAPTCHA not loaded');
        return null;
      }
      x;

      const token = await window.grecaptcha.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_KEY',
        { action: 'login' }
      );
      setCaptchaToken(token);
      setCaptchaCompleted(true);
      return token;
    } catch (err) {
      Logger.error('CAPTCHA execution failed', err);
      setError('Security verification failed. Please try again.');
      setErrorType(ERROR_TYPES.CAPTCHA_FAILED);
      return null;
    }
  }, []);

  /**
   * Gets dashboard path based on user type
   */
  const getDashboardPath = useCallback((userType) => {
    const dashboardMap = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      company: '/company/dashboard',
      institute: '/institute/dashboard',
      mentor: '/mentor/dashboard',
      youth: '/youth/dashboard',
      entrepreneur: '/entrepreneur/dashboard',
      parent: '/parent/dashboard',
      alumni: '/alumni/dashboard',
    };
    return dashboardMap[userType] || '/';
  }, []);

  // ==================== EFFECTS ====================
  /**
   * Initialize security tokens and session detection on mount
   */
  useEffect(() => {
    initializeSecurityTokens();

    // Handle location state message (e.g., from redirect after logout)
    if (location.state?.message) {
      setError(location.state.message);
      setErrorType(ERROR_TYPES.GENERIC);
      setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
      window.history.replaceState({}, document.title);
    }

    // Load remembered email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Generate and store session ID for hijacking detection
    const sessionId = generateSessionId();
    initialSessionIdRef.current = sessionId;
    sessionStorage.setItem('login_session_id', sessionId);
    sessionStorage.setItem('login_session_start', Date.now().toString());
  }, [location, initializeSecurityTokens, generateSessionId]);

  /**
   * Monitor for session hijacking and stale sessions
   */
  useEffect(() => {
    const monitorSession = () => {
      const storedSessionId = sessionStorage.getItem('login_session_id');
      const storedStartTime = parseInt(sessionStorage.getItem('login_session_start') || '0');
      const currentTime = Date.now();

      // Check if session ID has changed (potential hijacking)
      if (storedSessionId && storedSessionId !== initialSessionIdRef.current) {
        setError(
          '🔒 Security warning: Potential session anomaly detected. Please refresh and try again.'
        );
        setErrorType(ERROR_TYPES.SESSION_HIJACKED);
        setSessionCheckWarning(true);
        setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
        return;
      }

      // Check if session is unusually old (potential stale session - 1 hour timeout)
      if (storedStartTime && currentTime - storedStartTime > LOGIN_CONFIG.SESSION_TIMEOUT_MS) {
        setError('Your session has expired. Please refresh the page to continue.');
        setErrorType(ERROR_TYPES.GENERIC);
        setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
      }
    };

    sessionCheckTimerRef.current = setInterval(
      monitorSession,
      LOGIN_CONFIG.SESSION_CHECK_INTERVAL_MS
    );

    return () => {
      if (sessionCheckTimerRef.current) {
        clearInterval(sessionCheckTimerRef.current);
      }
    };
  }, []);

  /**
   * Cleanup on unmount - clear sensitive data and timers
   */
  useEffect(() => {
    return () => {
      if (lockoutTimerRef.current) {
        clearTimeout(lockoutTimerRef.current);
      }
      if (sessionCheckTimerRef.current) {
        clearInterval(sessionCheckTimerRef.current);
      }
      // Clear sensitive data
      if (!rememberMe) {
        setPassword('');
      }
      sessionStorage.removeItem('login_session_id');
      sessionStorage.removeItem('login_session_start');
    };
  }, [rememberMe]);

  /**
   * Countdown timer for lockout
   */
  useEffect(() => {
    if (!isRateLimited || lockoutTimeRemaining <= 0) {
      return;
    }

    lockoutTimerRef.current = setTimeout(() => {
      setLockoutTimeRemaining((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          setIsRateLimited(false);
          setLoginAttempts(0);
          setShowCaptcha(false);
          setCaptchaCompleted(false);
        }
        return newValue;
      });
    }, 1000);

    return () => {
      if (lockoutTimerRef.current) {
        clearTimeout(lockoutTimerRef.current);
      }
    };
  }, [isRateLimited, lockoutTimeRemaining]);

  /**
   * Update password strength in real-time
   */
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({
        checks: {},
        strength: 0,
        strengthLabel: 'Weak',
        strengthColor: 'danger',
        isValid: false,
      });
    }
  }, [password]);

  /**
   * Show CAPTCHA after threshold attempts
   */
  useEffect(() => {
    if (loginAttempts >= LOGIN_CONFIG.CAPTCHA_THRESHOLD_ATTEMPTS && !showCaptcha) {
      setShowCaptcha(true);
      executeCaptcha();
    }
  }, [loginAttempts, showCaptcha, executeCaptcha]);

  // ==================== LOGIN HANDLERS ====================
  /**
   * Main login handler with CSRF protection, CAPTCHA, and session hijacking detection
   */
  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();

      // Prevent double submission
      if (submissionInProgressRef.current || loading) {
        return;
      }
      submissionInProgressRef.current = true;

      setError('');
      setErrorType('');

      try {
        // Validate offline status
        if (isOffline) {
          setError('📡 You are offline. Please check your internet connection and try again.');
          setErrorType(ERROR_TYPES.NETWORK_ERROR);
          submissionInProgressRef.current = false;
          return;
        }

        // Validate inputs
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
          setError('Please enter both email and password.');
          setErrorType(ERROR_TYPES.GENERIC);
          submissionInProgressRef.current = false;
          return;
        }

        if (!validateEmail(trimmedEmail)) {
          setError('Please enter a valid email address (e.g., user@example.com).');
          setErrorType(ERROR_TYPES.GENERIC);
          submissionInProgressRef.current = false;
          return;
        }

        // Check rate limiting
        if (isRateLimited) {
          setError(
            `⏰ Too many login attempts. Please try again in ${lockoutTimeRemaining} seconds.`
          );
          setErrorType(ERROR_TYPES.RATE_LIMITED);
          submissionInProgressRef.current = false;
          return;
        }

        // Require CAPTCHA if threshold met
        if (showCaptcha && !captchaCompleted) {
          setError('Please complete the security verification.');
          setErrorType(ERROR_TYPES.CAPTCHA_FAILED);
          submissionInProgressRef.current = false;
          return;
        }

        setLoading(true);

        // Build login payload with security tokens
        const loginPayload = {
          email: trimmedEmail.toLowerCase(),
          password: trimmedPassword,
          ...(csrfToken && { csrfToken }),
          ...(captchaToken && { captchaToken }),
          sessionId: initialSessionIdRef.current,
        };

        const response = await login(loginPayload);

        if (response.success) {
          // Reset attempts on success
          setLoginAttempts(0);
          setIsRateLimited(false);
          setCaptchaCompleted(false);

          const target = location.state?.from?.pathname || getDashboardPath(response.userType);

          // Handle remember me
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', trimmedEmail.toLowerCase());
          } else {
            localStorage.removeItem('rememberedEmail');
          }

          // Clear form on success
          setPassword('');

          // Navigate after short delay to ensure context updates
          setTimeout(() => {
            navigate(target, { replace: true });
          }, LOGIN_CONFIG.NAVIGATION_DELAY_MS);
        } else {
          // Handle specific error types
          const detectedErrorType = mapErrorToType(response.error);
          setErrorType(detectedErrorType);

          // Handle rate limiting
          if (detectedErrorType === ERROR_TYPES.RATE_LIMITED) {
            setIsRateLimited(true);
            const match = response.error?.match(/(\d+)\s*minutes?/);
            const minutes = match ? parseInt(match[1]) : LOGIN_CONFIG.LOCKOUT_DURATION_MINUTES;
            setLockoutTimeRemaining(minutes * 60);
            setLoginAttempts(0);
          } else {
            // Increment attempts
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);

            // Auto-lock after max attempts
            if (newAttempts >= LOGIN_CONFIG.MAX_LOGIN_ATTEMPTS) {
              setIsRateLimited(true);
              setLockoutTimeRemaining(LOGIN_CONFIG.LOCKOUT_DURATION_MINUTES * 60);
              setError(
                response.error ||
                  `🔒 Too many login attempts. Please try again in ${LOGIN_CONFIG.LOCKOUT_DURATION_MINUTES} minutes.`
              );
            } else {
              const attemptsLeft = LOGIN_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts;
              setError(
                response.error ||
                  `Login failed. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
              );
            }
          }

          // Focus error for accessibility
          setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
        }
      } catch (submitError) {
        const errorMsg = submitError?.message || 'An unexpected error occurred. Please try again.';
        setError(errorMsg);
        setErrorType(mapErrorToType(errorMsg));
        Logger.error('Login error', submitError);

        // Focus error for accessibility
        setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
      } finally {
        setLoading(false);
        submissionInProgressRef.current = false;
      }
    },
    [
      loading,
      email,
      password,
      isOffline,
      validateEmail,
      isRateLimited,
      lockoutTimeRemaining,
      login,
      location,
      rememberMe,
      getDashboardPath,
      loginAttempts,
      mapErrorToType,
      navigate,
      showCaptcha,
      captchaCompleted,
      csrfToken,
      captchaToken,
    ]
  );

  /**
   * Google login handler
   */
  const handleGoogleLogin = useCallback(async () => {
    if (submissionInProgressRef.current || loading) {
      return;
    }
    submissionInProgressRef.current = true;

    if (isOffline) {
      setError('📡 You are offline. Please check your internet connection and try again.');
      setErrorType(ERROR_TYPES.NETWORK_ERROR);
      submissionInProgressRef.current = false;
      return;
    }

    setError('');
    setErrorType('');
    setLoading(true);

    try {
      const response = await loginWithGoogle({ userType: role });

      if (response.success) {
        const target = location.state?.from?.pathname || getDashboardPath(response.userType);
        setTimeout(() => {
          navigate(target, { replace: true });
        }, LOGIN_CONFIG.NAVIGATION_DELAY_MS);
      } else {
        const detectedErrorType = mapErrorToType(response.error);
        setErrorType(detectedErrorType);
        setError(response.error || 'Google login failed. Please try again.');
        setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
      }
    } catch (googleError) {
      const errorMsg = googleError?.message || 'Google login failed. Please try again.';
      setError(errorMsg);
      setErrorType(mapErrorToType(errorMsg));
      Logger.error('Google login error', googleError);
      setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
    } finally {
      setLoading(false);
      submissionInProgressRef.current = false;
    }
  }, [
    loading,
    isOffline,
    role,
    loginWithGoogle,
    location,
    getDashboardPath,
    mapErrorToType,
    navigate,
  ]);

  // ==================== RENDER ====================
  return (
    <div
      className="login-page min-vh-100 d-flex align-items-center py-5"
      data-testid="login-form"
      role="main"
      aria-label="Login page"
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8} xl={6}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-lg-5">
                {/* Header */}
                <div className="mb-4 text-center">
                  <h1 className="fw-bold mb-2" id="login-title">
                    Sign in to Career Connect
                  </h1>
                  <p className="text-muted small">
                    Sign in to access your personalized dashboard and manage your account.
                  </p>
                </div>

                {/* Session Hijacking Warning */}
                {sessionCheckWarning && (
                  <Alert
                    variant="danger"
                    className="mb-4 d-flex align-items-start"
                    role="alert"
                    aria-live="assertive"
                  >
                    <FaShieldAlt className="me-2 mt-1 flex-shrink-0" />
                    <div>
                      <strong>🔒 Security Alert</strong>
                      <p className="mb-0 mt-2 small">
                        We detected suspicious activity. Please refresh the page and try again.
                      </p>
                    </div>
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert
                    variant={
                      errorType === ERROR_TYPES.RATE_LIMITED ||
                      errorType === ERROR_TYPES.SESSION_HIJACKED
                        ? 'warning'
                        : errorType === ERROR_TYPES.EMAIL_NOT_VERIFIED
                          ? 'info'
                          : 'danger'
                    }
                    dismissible
                    onClose={() => {
                      setError('');
                      setErrorType('');
                    }}
                    data-testid="error-message"
                    className="mb-4"
                    ref={errorAlertRef}
                    tabIndex="-1"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                  >
                    <div className="d-flex align-items-start">
                      {errorType === ERROR_TYPES.RATE_LIMITED && (
                        <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0 text-warning" />
                      )}
                      {errorType === ERROR_TYPES.USER_DISABLED && (
                        <FaShieldAlt className="me-2 mt-1 flex-shrink-0 text-danger" />
                      )}
                      {(errorType === ERROR_TYPES.SESSION_HIJACKED ||
                        errorType === ERROR_TYPES.CSRF_FAILED) && (
                        <FaTimesCircle className="me-2 mt-1 flex-shrink-0 text-danger" />
                      )}
                      <div>
                        <strong>
                          {errorType === ERROR_TYPES.RATE_LIMITED
                            ? '⏰ Too Many Attempts'
                            : errorType === ERROR_TYPES.EMAIL_NOT_VERIFIED
                              ? '✉️ Email Verification Required'
                              : errorType === ERROR_TYPES.USER_DISABLED
                                ? '🔒 Account Disabled'
                                : errorType === ERROR_TYPES.NETWORK_ERROR
                                  ? '📡 Connection Error'
                                  : errorType === ERROR_TYPES.SESSION_HIJACKED
                                    ? '🚨 Security Alert'
                                    : errorType === ERROR_TYPES.CAPTCHA_FAILED
                                      ? '🤖 Verification Failed'
                                      : errorType === ERROR_TYPES.CSRF_FAILED
                                        ? '🔐 Security Check Failed'
                                        : '❌ Login Error'}
                        </strong>
                        <p className="mb-0 mt-2">{error}</p>
                        {errorType === ERROR_TYPES.EMAIL_NOT_VERIFIED && (
                          <p className="mb-0 mt-2 small">
                            <Link to="/resend-verification" className="text-decoration-none">
                              Didn't receive the email? Resend verification
                            </Link>
                          </p>
                        )}
                        {errorType === ERROR_TYPES.USER_DISABLED && (
                          <p className="mb-0 mt-2 small">
                            <Link to="/contact-support" className="text-decoration-none">
                              Contact support for assistance
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Rate Limit Warning */}
                {isRateLimited && loginAttempts > 0 && !error && (
                  <Alert
                    variant="warning"
                    className="mb-4 d-flex align-items-start"
                    role="status"
                    aria-live="polite"
                  >
                    <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" />
                    <div>
                      <strong>⏰ Account temporarily locked</strong>
                      <p className="mb-0 mt-2 small">
                        This is a security measure after multiple failed login attempts. Please wait{' '}
                        <span className="fw-bold">{lockoutTimeRemaining}</span> second
                        {lockoutTimeRemaining !== 1 ? 's' : ''} before trying again.
                      </p>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleLogin} ref={formRef} noValidate aria-labelledby="login-title">
                  {/* Email Input */}
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="email" className="fw-semibold">
                      <FaEnvelope className="me-2" /> Email Address
                    </Form.Label>
                    <Form.Control
                      id="email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      disabled={loading || isRateLimited || sessionCheckWarning}
                      autoComplete="email"
                      required
                      data-testid="email-input"
                      aria-describedby="email-help"
                      aria-required="true"
                      aria-invalid={email && !validateEmail(email) ? 'true' : 'false'}
                    />
                    <Form.Text id="email-help" className="text-muted small mt-1 d-block">
                      Use the email address associated with your account
                    </Form.Text>
                  </Form.Group>

                  {/* Password Input with Strength Indicator */}
                  <Form.Group className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label htmlFor="password" className="fw-semibold mb-0">
                        <FaLock className="me-2" /> Password
                      </Form.Label>
                      <Link
                        to="/forgot-password"
                        className="small"
                        aria-label="Go to forgot password page"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="position-relative">
                      <Form.Control
                        id="password"
                        type={showPassword || showPasswordOnHover ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onMouseEnter={() => setShowPasswordOnHover(true)}
                        onMouseLeave={() => setShowPasswordOnHover(false)}
                        placeholder="Enter your password"
                        disabled={loading || isRateLimited || sessionCheckWarning}
                        autoComplete="current-password"
                        required
                        data-testid="password-input"
                        aria-describedby="password-help password-strength"
                        aria-required="true"
                        aria-invalid={password && !passwordStrength.isValid ? 'true' : 'false'}
                      />
                      <Button
                        ref={passwordToggleRef}
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y p-0 text-dark"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        tabIndex="0"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2">
                        <ProgressBar
                          now={passwordStrength.strength}
                          variant={passwordStrength.strengthColor}
                          className="mb-2"
                          style={{ height: '4px' }}
                          role="progressbar"
                          aria-valuenow={passwordStrength.strength}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-label="Password strength"
                        />
                        <div id="password-strength" className="small text-muted">
                          Strength:{' '}
                          <span className={`text-${passwordStrength.strengthColor} fw-semibold`}>
                            {passwordStrength.strengthLabel}
                          </span>
                        </div>
                        <div className="small mt-2" id="password-help">
                          <ul className="list-unstyled">
                            {Object.entries(passwordStrength.checks).map(([check, passed]) => (
                              <li key={check} className={passed ? 'text-success' : 'text-muted'}>
                                {passed ? (
                                  <FaCheckCircle className="me-1" />
                                ) : (
                                  <FaTimesCircle className="me-1" />
                                )}
                                {check === 'length'
                                  ? `At least ${LOGIN_CONFIG.PASSWORD_MIN_LENGTH} characters`
                                  : check === 'uppercase'
                                    ? 'One uppercase letter'
                                    : check === 'lowercase'
                                      ? 'One lowercase letter'
                                      : check === 'number'
                                        ? 'One number'
                                        : 'One special character'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  {/* Remember Me & Forgot Password */}
                  <Form.Group className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      id="rememberMe"
                      type="checkbox"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading || isRateLimited}
                      aria-label="Remember me on this device"
                    />
                  </Form.Group>

                  {/* Role Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="userRole" className="fw-semibold">
                      Login as
                    </Form.Label>
                    <Form.Select
                      id="userRole"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading || isRateLimited || sessionCheckWarning}
                      aria-label="Select user role for login"
                      aria-describedby="role-help"
                    >
                      {LOGIN_ROLES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text id="role-help" className="text-muted small mt-1 d-block">
                      ⚠️ Your actual role will be verified by the system. The system enforces
                      role-based permissions.
                    </Form.Text>
                  </Form.Group>

                  {/* CAPTCHA Status */}
                  {showCaptcha && (
                    <Alert variant="info" className="mb-4 small d-flex align-items-start">
                      <FaShieldAlt className="me-2 mt-1 flex-shrink-0" />
                      <div>
                        <strong>🤖 Security verification required</strong>
                        <p className="mb-0 mt-1">
                          {captchaCompleted
                            ? 'Verification completed. Click Sign In to continue.'
                            : 'Verifying...'}
                        </p>
                      </div>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid gap-2 mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      data-testid="login-button"
                      disabled={
                        loading ||
                        isRateLimited ||
                        sessionCheckWarning ||
                        (showCaptcha && !captchaCompleted)
                      }
                      aria-busy={loading}
                      aria-label={
                        loading
                          ? 'Signing in, please wait'
                          : isRateLimited
                            ? 'Too many attempts, please wait'
                            : sessionCheckWarning
                              ? 'Session error, please refresh'
                              : showCaptcha && !captchaCompleted
                                ? 'Completing verification'
                                : 'Sign in to your account'
                      }
                    >
                      {loading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                            role="status"
                            aria-label="Loading"
                          />
                          Signing in...
                        </>
                      ) : isRateLimited ? (
                        <>
                          <FaLock className="me-2" />
                          Temporarily Locked
                        </>
                      ) : sessionCheckWarning ? (
                        <>
                          <FaExclamationTriangle className="me-2" />
                          Please Refresh
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>

                  <div className="text-center small text-muted mb-3">or continue with</div>

                  {/* Google Sign In */}
                  <div className="d-grid gap-2 mb-3">
                    <Button
                      variant="outline-dark"
                      size="lg"
                      onClick={handleGoogleLogin}
                      disabled={loading || isRateLimited || sessionCheckWarning}
                      aria-label="Continue with Google account"
                    >
                      <FaGoogle className="me-2" /> Continue with Google
                    </Button>
                  </div>

                  {/* Register Link */}
                  <div className="text-center">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" data-testid="register-link" className="fw-semibold">
                      Create one now
                    </Link>
                  </div>
                </Form>

                {/* Security Notice */}
                <div className="mt-4 p-3 bg-light rounded small text-muted">
                  <FaShieldAlt className="me-2 text-success" />
                  <strong>🔐 Security Notice:</strong> We never store your password in plain text.
                  Always log in from trusted devices.{' '}
                  <Link to="/security">Review your security settings</Link>.
                </div>
              </Card.Body>
            </Card>

            {/* Footer Info */}
            <div className="text-center mt-4 small text-muted">
              <p>
                Protected by reCAPTCHA and subject to the{' '}
                <Link to="/privacy" className="text-decoration-none">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link to="/terms" className="text-decoration-none">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
