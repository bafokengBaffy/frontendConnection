import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const { login, loginWithGoogle, userProfile, loading, error, clearError, isAuthenticated, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 Login useEffect:', {
      isAuthenticated,
      loading,
      userProfile: userProfile ? {
        email: userProfile.email,
        userType: userProfile.userType,
        isAdmin: userProfile.isAdmin
      } : null
    });
    
    if (isAuthenticated && userProfile && !loading) {
      console.log('✅ User authenticated, redirecting...');
      
      const dashboardPath = getDashboardPath();
      console.log('🎯 Dashboard path:', dashboardPath);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate(dashboardPath, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, userProfile, loading, navigate, getDashboardPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};

    if (!credentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      console.log('🔐 Submitting login form');
      const result = await login(credentials);
      
      if (result.success) {
        console.log('✅ Login successful:', {
          email: result.user?.email,
          userType: result.userType,
          isAdmin: result.isAdmin
        });
        setLocalError(null);
      } else {
        console.error('Login failed:', result.error);
        setLocalError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      console.log('🔐 Attempting Google login');
      const result = await loginWithGoogle();
      
      if (result.success) {
        console.log('✅ Google login successful');
        setLocalError(null);
      } else {
        console.error('Google login failed:', result.error);
        setLocalError(result.error);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setLocalError('Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  // Show loading during auth initialization
  if (loading && !isSubmitting) {
    return (
      <Container fluid className="auth-container d-flex align-items-center justify-content-center min-vh-100">
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
      <Container fluid className="auth-container d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-success">
            Login successful! Redirecting to your dashboard...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="auth-container d-flex align-items-center justify-content-center min-vh-100 py-5">
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="auth-card shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              
              <div className="text-center mb-4">
                <div className="logo-container mb-4">
                  <div className="logo-icon d-inline-flex align-items-center justify-content-center">
                    <i className="bi bi-rocket-takeoff-fill"></i>
                  </div>
                </div>
                <h2 className="auth-title fw-bold mb-2">Welcome Back</h2>
                <p className="text-muted mb-0">Sign in to your account to continue</p>
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
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <Form.Control
                      type="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter your email"
                      isInvalid={!!formErrors.email}
                      className="border-start-0"
                    />
                  </div>
                  {formErrors.email && (
                    <Form.Text className="text-danger small">{formErrors.email}</Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <Form.Control
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter your password"
                      isInvalid={!!formErrors.password}
                      className="border-start-0"
                    />
                  </div>
                  {formErrors.password && (
                    <Form.Text className="text-danger small">{formErrors.password}</Form.Text>
                  )}
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="remember-me"
                    label="Remember me"
                    className="text-muted small"
                  />
                  <Link to="/forgot-password" className="text-decoration-none small">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 mb-3 fw-medium"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
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
                className="w-100 py-2 mb-3 fw-medium"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                size="lg"
              >
                <i className="bi bi-google me-2"></i>
                Sign in with Google
              </Button>

              <div className="text-center mt-4 pt-3 border-top">
                <p className="text-muted mb-0">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-decoration-none fw-medium">
                    Create account
                  </Link>
                </p>
                <p className="text-muted small mt-2">
                  <strong>Admin:</strong> Use <code>baffkay20@gmail.com</code>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;