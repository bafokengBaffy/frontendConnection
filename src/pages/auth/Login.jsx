import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  const {
    login,
    loginWithGoogle,
    userProfile,
    loading,
    error,
    clearError,
    isAuthenticated,
    getDashboardPath,
    resetPassword,
    validateEmail,
  } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && userProfile && !loading) {
      const dashboardPath = getDashboardPath();

      // Redirect after short delay
      setTimeout(() => {
        navigate(dashboardPath, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, userProfile, loading, navigate, getDashboardPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};

    if (!credentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    clearError();
    setLocalError(null);

    try {
      const result = await login(credentials);

      if (!result.success) {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      const result = await loginWithGoogle();

      if (!result.success) {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError('Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetMessage({ type: 'danger', text: 'Please enter your email address' });
      return;
    }

    if (!validateEmail(resetEmail)) {
      setResetMessage({ type: 'danger', text: 'Please enter a valid email address' });
      return;
    }

    setResetLoading(true);
    setResetMessage(null);

    try {
      const result = await resetPassword(resetEmail);

      if (result.success) {
        setResetMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          setShowResetModal(false);
          setResetEmail('');
          setResetMessage(null);
        }, 3000);
      } else {
        setResetMessage({ type: 'danger', text: result.error });
      }
    } catch (error) {
      setResetMessage({ type: 'danger', text: 'Failed to send reset email. Please try again.' });
    } finally {
      setResetLoading(false);
    }
  };

  const displayError = localError || error;

  // Show loading during auth initialization
  if (loading && !isSubmitting) {
    return (
      <Container
        fluid
        className="auth-container d-flex align-items-center justify-content-center min-vh-100"
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </Container>
    );
  }

  // Show redirecting message when authenticated
  if (isAuthenticated && userProfile) {
    return (
      <Container
        fluid
        className="auth-container d-flex align-items-center justify-content-center min-vh-100"
      >
        <div className="text-center">
          <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-success">Login successful! Redirecting to your dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container
        fluid
        className="auth-container d-flex align-items-center justify-content-center min-vh-100 py-5"
      >
        <Row className="justify-content-center w-100">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="auth-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="logo-container mb-4">
                    <div className="logo-icon d-inline-flex align-items-center justify-content-center">
                      <i className="bi bi-shield-lock-fill"></i>
                    </div>
                  </div>
                  <h2 className="auth-title fw-bold mb-2">Welcome Back</h2>
                  <p className="text-muted mb-0">Secure sign in to your account</p>
                </div>

                {displayError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => {
                      if (localError) setLocalError(null);
                      if (error) clearError();
                    }}
                    className="border-0"
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <span>{displayError}</span>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      <i className="bi bi-envelope-fill me-2"></i>
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter your email"
                      isInvalid={!!formErrors.email}
                      size="lg"
                    />
                    {formErrors.email && (
                      <Form.Text className="text-danger small">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {formErrors.email}
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">
                      <i className="bi bi-lock-fill me-2"></i>
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter your password"
                      isInvalid={!!formErrors.password}
                      size="lg"
                    />
                    {formErrors.password && (
                      <Form.Text className="text-danger small">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {formErrors.password}
                      </Form.Text>
                    )}
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="remember-me"
                      label="Remember me"
                      className="text-muted small"
                    />
                    <Button
                      variant="link"
                      className="text-decoration-none p-0 small"
                      onClick={() => setShowResetModal(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-3 mb-3 fw-medium"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In Securely'
                    )}
                  </Button>
                </Form>

                <div className="divider my-4 position-relative">
                  <hr className="my-0" />
                  <span className="divider-text bg-white px-3 position-absolute top-50 start-50 translate-middle">
                    Or continue with
                  </span>
                </div>

                <Button
                  variant="outline-secondary"
                  className="w-100 py-3 mb-3 fw-medium"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  size="lg"
                >
                  <i className="bi bi-google me-2"></i>
                  Sign in with Google
                </Button>

                <div className="text-center mt-4 pt-3 border-top">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none fw-medium">
                      Create account
                    </Link>
                  </p>
                  <p className="text-muted small mt-2">
                    <i className="bi bi-shield-check me-1"></i>
                    Secure authentication with email verification
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Password Reset Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <i className="bi bi-key-fill me-2 text-primary"></i>
            Reset Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="text-muted mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {resetMessage && (
            <Alert variant={resetMessage.type} className="mb-3">
              {resetMessage.text}
            </Alert>
          )}

          <Form.Group>
            <Form.Label className="fw-medium">Email Address</Form.Label>
            <Form.Control
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              size="lg"
              disabled={resetLoading}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="secondary"
            onClick={() => setShowResetModal(false)}
            disabled={resetLoading}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleResetPassword} disabled={resetLoading}>
            {resetLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Login;
