import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

// ==================== CONSTANTS ====================
const LOGIN_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  FOCUS_DELAY_MS: 100,
  NAVIGATION_DELAY_MS: 100,
  SESSION_CHECK_INTERVAL_MS: 30000, // 30 seconds
  PASSWORD_MIN_LENGTH: 8,
  CAPTCHA_THRESHOLD_ATTEMPTS: 3, // Show CAPTCHA after 3 failed attempts
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
const Logger = {
  error: (message, data) => {
    // In production, this should send to a logging service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Login Error] ${message}`, data);
    } else {
      // Send to external logging service
      // Example: Sentry.captureException(new Error(message));
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
const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= LOGIN_CONFIG.PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password),
  };

  const checksPassed = Object.values(checks).filter(Boolean).length;
  const strengthPercentage = (checksPassed / Object.keys(checks).length) * 100;

  return {
    checks,
    strength: Math.ceil(strengthPercentage / 25) * 25, // 0, 25, 50, 75, 100
    strengthLabel:
      strengthPercentage >= 80 ? 'Strong' : strengthPercentage >= 60 ? 'Medium' : 'Weak',
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
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [sessionCheckWarning, setSessionCheckWarning] = useState(false);

  // ==================== PASSWORD STRENGTH ====================
  const [passwordStrength, setPasswordStrength] = useState({
    checks: {},
    strength: 0,
    strengthLabel: 'Weak',
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

  // ==================== EFFECTS ====================
  // Initialize CSRF token and session detection
  useEffect(() => {
    const initializeSecurityTokens = async () => {
      try {
        // Fetch CSRF token from backend
        const csrfResponse = await fetch('/api/auth/csrf-token', {
          method: 'GET',
          credentials: 'include',
        });

        if (csrfResponse.ok) {
          const { token } = await csrfResponse.json();
          setCsrfToken(token);
        }
      } catch (err) {
        Logger.warn('Failed to fetch CSRF token', err);
        // Continue without CSRF - backend should handle
      }

      // Generate and store initial session ID for hijacking detection
      const sessionId = generateSessionId();
      initialSessionIdRef.current = sessionId;
      sessionStorage.setItem('login_session_id', sessionId);
      sessionStorage.setItem('login_session_start', Date.now().toString());
    };

    initializeSecurityTokens();

    // Load remembered email
    if (location.state?.message) {
      setError(location.state.message);
      setErrorType(ERROR_TYPES.GENERIC);
      setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
      window.history.replaceState({}, document.title);
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [location]);

  // Monitor for session hijacking
  useEffect(() => {
    const monitorSession = () => {
      const storedSessionId = sessionStorage.getItem('login_session_id');
      const storedStartTime = parseInt(sessionStorage.getItem('login_session_start') || '0');
      const currentTime = Date.now();

      // Check if session ID has changed (potential hijacking)
      if (storedSessionId && storedSessionId !== initialSessionIdRef.current) {
        setError(
          'Security warning: Potential session anomaly detected. Please refresh and try again.'
        );
        setErrorType(ERROR_TYPES.SESSION_HIJACKED);
        setSessionCheckWarning(true);
        setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
        return;
      }

      // Check if session is unusually old (potential stale session)
      if (storedStartTime && currentTime - storedStartTime > 3600000) {
        // 1 hour
        setError('Your session has expired. Please refresh the page to continue.');
        setErrorType(ERROR_TYPES.GENERIC);
        setTimeout(() => errorAlertRef.current?.focus(), LOGIN_CONFIG.FOCUS_DELAY_MS);
      }
    };

    // Run session check periodically
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lockoutTimerRef.current) {
        clearTimeout(lockoutTimerRef.current);
      }
      if (sessionCheckTimerRef.current) {
        clearInterval(sessionCheckTimerRef.current);
      }
      // Clear sensitive data on unmount
      if (!rememberMe) {
        setPassword('');
      }
      // Clear session data
      sessionStorage.removeItem('login_session_id');
      sessionStorage.removeItem('login_session_start');
    };
  }, [rememberMe]);

  // Decrement lockout timer
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

  // Update password strength in real-time
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ checks: {}, strength: 0, strengthLabel: 'Weak', isValid: false });
    }
  }, [password]);

  // ==================== UTILITY FUNCTIONS ====================
  const generateSessionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

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

  // ==================== LOGIN HANDLERS ====================
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
          setError('You are offline. Please check your internet connection and try again.');
          setErrorType(ERROR_TYPES.NETWORK_ERROR);
          return;
        }

        // Validate inputs
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
          setError('Please enter both email and password.');
          setErrorType(ERROR_TYPES.GENERIC);
          return;
        }

        if (!validateEmail(trimmedEmail)) {
          setError('Please enter a valid email address (e.g., user@example.com).');
          setErrorType(ERROR_TYPES.GENERIC);
          return;
        }

        // Check rate limiting
        if (isRateLimited) {
          setError(`Too many login attempts. Please try again in ${lockoutTimeRemaining} seconds.`);
          setErrorType(ERROR_TYPES.RATE_LIMITED);
          return;
        }

        setLoading(true);

        const response = await login({
          email: trimmedEmail.toLowerCase(),
          password: trimmedPassword,
        });

        if (response.success) {
          // Reset attempts on success
          setLoginAttempts(0);
          setIsRateLimited(false);

          const target = location.state?.from?.pathname || getDashboardPath(response.userType);

          // Handle remember me
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', trimmedEmail.toLowerCase());
          } else {
            localStorage.removeItem('rememberedEmail');
          }

          // Clear form on success
          setPassword('');

          // Small delay to ensure context updates before navigation
          setTimeout(() => {
            navigate(target, { replace: true });
          }, 100);
        } else {
          // Handle specific error types
          const detectedErrorType = mapErrorToType(response.error);
          setErrorType(detectedErrorType);

          // Update rate limiting UI if needed
          if (detectedErrorType === ERROR_TYPES.RATE_LIMITED) {
            setIsRateLimited(true);
            // Extract or set default lockout time (in seconds)
            const match = response.error?.match(/(\d+)\s*minutes?/);
            const minutes = match ? parseInt(match[1]) : 15;
            setLockoutTimeRemaining(minutes * 60);
            setLoginAttempts(0);
          } else {
            // Increment attempts for non-rate-limited errors
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);

            // Lock after 5 attempts to prevent brute force
            if (newAttempts >= 5) {
              setIsRateLimited(true);
              setLockoutTimeRemaining(15 * 60); // 15 minute lockout
              setError(
                response.error || 'Too many login attempts. Please try again in 15 minutes.'
              );
            } else {
              setError(response.error || 'Login failed. Please check your credentials.');
            }
          }

          // Focus error message for accessibility
          setTimeout(() => errorAlertRef.current?.focus(), 100);
        }
      } catch (submitError) {
        const errorMsg = submitError?.message || 'An unexpected error occurred. Please try again.';
        setError(errorMsg);
        setErrorType(mapErrorToType(errorMsg));
        console.error('Login error:', submitError);

        // Focus error message
        setTimeout(() => errorAlertRef.current?.focus(), 100);
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
    ]
  );

  const handleGoogleLogin = useCallback(async () => {
    if (submissionInProgressRef.current || loading) {
      return;
    }
    submissionInProgressRef.current = true;

    if (isOffline) {
      setError('You are offline. Please check your internet connection and try again.');
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
        }, 100);
      } else {
        const detectedErrorType = mapErrorToType(response.error);
        setErrorType(detectedErrorType);
        setError(response.error || 'Google login failed. Please try again.');
        setTimeout(() => errorAlertRef.current?.focus(), 100);
      }
    } catch (googleError) {
      const errorMsg = googleError?.message || 'Google login failed. Please try again.';
      setError(errorMsg);
      setErrorType(mapErrorToType(errorMsg));
      console.error('Google login error:', googleError);
      setTimeout(() => errorAlertRef.current?.focus(), 100);
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
                <div className="mb-4 text-center">
                  <h1 className="fw-bold mb-2" id="login-title">
                    Sign in to Career Connect
                  </h1>
                  <p className="text-muted">
                    Sign in to access your personalized dashboard and manage your account.
                  </p>
                </div>

                {/* Error Alert - Production Ready */}
                {error && (
                  <Alert
                    variant={
                      errorType === ERROR_TYPES.RATE_LIMITED
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
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className="d-flex align-items-start">
                      {errorType === ERROR_TYPES.RATE_LIMITED && (
                        <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" />
                      )}
                      {errorType === ERROR_TYPES.USER_DISABLED && (
                        <FaShieldAlt className="me-2 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <strong>
                          {errorType === ERROR_TYPES.RATE_LIMITED
                            ? 'Too Many Attempts'
                            : errorType === ERROR_TYPES.EMAIL_NOT_VERIFIED
                              ? 'Email Verification Required'
                              : errorType === ERROR_TYPES.USER_DISABLED
                                ? 'Account Disabled'
                                : errorType === ERROR_TYPES.NETWORK_ERROR
                                  ? 'Connection Error'
                                  : 'Login Error'}
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
                {isRateLimited && loginAttempts > 0 && (
                  <Alert
                    variant="warning"
                    className="mb-4 d-flex align-items-start"
                    role="status"
                    aria-live="polite"
                  >
                    <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Account temporarily locked</strong>
                      <p className="mb-0 mt-2 small">
                        This is a security measure after multiple failed login attempts. Please wait{' '}
                        {lockoutTimeRemaining} seconds before trying again.
                      </p>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleLogin} ref={formRef} noValidate aria-labelledby="login-title">
                  {/* Email Field */}
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
                      disabled={loading || isRateLimited}
                      autoComplete="email"
                      required
                      data-testid="email-input"
                      aria-describedby="email-help"
                      aria-required="true"
                    />
                    <Form.Text id="email-help" className="text-muted small mt-1 d-block">
                      Use the email address associated with your account
                    </Form.Text>
                  </Form.Group>

                  {/* Password Field with Toggle */}
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
                        Forgot password?
                      </Link>
                    </div>
                    <div className="position-relative">
                      <Form.Control
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading || isRateLimited}
                        autoComplete="current-password"
                        required
                        data-testid="password-input"
                        aria-describedby="password-help"
                        aria-required="true"
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
                    <Form.Text id="password-help" className="text-muted small mt-1 d-block">
                      {password
                        ? 'Password should be strong with mixed case, numbers, and special characters'
                        : 'Keep your password secure and never share it'}
                    </Form.Text>
                  </Form.Group>

                  {/* Remember Me and Forgot Password */}
                  <Form.Group className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      id="rememberMe"
                      type="checkbox"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      aria-label="Remember me on this device"
                    />
                  </Form.Group>

                  {/* Role Selection with Warning */}
                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="userRole" className="fw-semibold">
                      Login as
                    </Form.Label>
                    <Form.Select
                      id="userRole"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading || isRateLimited}
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
                      ⚠️ Your actual role will be verified by the system. Incorrect role selection
                      may limit your access.
                    </Form.Text>
                  </Form.Group>

                  {/* Submit Button */}
                  <div className="d-grid gap-2 mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      data-testid="login-button"
                      disabled={loading || isRateLimited}
                      aria-busy={loading}
                      aria-label={
                        loading
                          ? 'Signing in, please wait'
                          : isRateLimited
                            ? 'Too many attempts, please wait'
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
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="text-center small text-muted mb-3">or continue with</div>

                  {/* Google Sign In */}
                  <div className="d-grid gap-2 mb-3">
                    <Button
                      variant="outline-dark"
                      size="lg"
                      onClick={handleGoogleLogin}
                      disabled={loading || isRateLimited}
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
                  <strong>Security Notice:</strong> We never store your password in plain text.
                  Always log in from trusted devices. If you see unexpected activity,{' '}
                  <Link to="/security" className="text-decoration-none">
                    review your security settings
                  </Link>
                  .
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
