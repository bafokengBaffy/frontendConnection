import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaGoogle, FaGraduationCap, FaBuilding, FaEnvelope, FaLock, FaUser, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    userType: "student",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { register: authRegister, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const userTypes = [
    {
      value: "student",
      label: "Student",
      description: "Explore courses, apply for internships and jobs",
      icon: <FaGraduationCap className="display-4" />,
      color: "primary",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      value: "company",
      label: "Company",
      description: "Hire talent, post jobs and internships",
      icon: <FaBuilding className="display-4" />,
      color: "secondary",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle user type selection
  const handleUserTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      userType: type,
    }));
    
    // Clear errors
    setErrors({});
  };

  // Simple validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // Google Registration
  const handleGoogleRegistration = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      if (!formData.userType) {
        setErrors({ submit: "Please select your account type first" });
        setIsGoogleLoading(false);
        return;
      }

      const result = await loginWithGoogle(formData.userType);
      
      if (!result.success) {
        throw new Error(result.error || "Google registration failed");
      }

      const successMsg = formData.userType === "company" 
        ? "Company account created successfully! Redirecting..."
        : "Welcome! Redirecting to your dashboard...";
      
      setSuccessMessage(successMsg);
      
      const redirectPath = getRedirectPath(result.userType);
      navigate(redirectPath, { replace: true });

    } catch (error) {
      console.error("Google registration error:", error);
      
      let errorMessage = "Google authentication failed. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google sign-up was cancelled.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup blocked. Please allow popups for this site.";
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Manual Registration
  const handleManualRegistration = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const registrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        userType: formData.userType,
      };

      const registerResult = await authRegister(registrationData);
      
      if (!registerResult.success) {
        throw new Error(registerResult.error || "Registration failed");
      }

      const successMsg = formData.userType === "company"
        ? "Company account created successfully!"
        : "Registration successful! Welcome to Career Connect.";
      
      setSuccessMessage(successMsg);

      // Reset form
      setFormData({
        userType: formData.userType,
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect after success
      setTimeout(() => {
        const redirectPath = getRedirectPath(formData.userType);
        navigate(redirectPath, { replace: true });
      }, 1500);

    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Get redirect path
  const getRedirectPath = (userType) => {
    switch (userType) {
      case "student":
        return "/student/dashboard";
      case "company":
        return "/company/dashboard";
      default:
        return "/student/dashboard";
    }
  };

  return (
    <div className="registration-container min-vh-100 d-flex align-items-center" 
         style={{
           background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
           padding: "2rem 0"
         }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <Card className="border-0 shadow-lg overflow-hidden">
              <Row className="g-0">
                {/* Left Side - Branding & Info */}
                <Col md={5} className="d-none d-md-flex">
                  <div className="h-100 p-5 text-white" 
                       style={{
                         background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                       }}>
                    <div className="d-flex flex-column h-100">
                      <div className="mb-5">
                        <h1 className="h2 fw-bold mb-2">Career Connect</h1>
                        <h2 className="h4 fw-light opacity-75">Lesotho</h2>
                      </div>
                      
                      <div className="flex-grow-1 d-flex flex-column justify-content-center">
                        <div className="mb-5">
                          <div className="d-flex align-items-center mb-4">
                            <div className="icon-circle me-3" style={{background: 'rgba(255,255,255,0.2)'}}>
                              <FaGraduationCap />
                            </div>
                            <div>
                              <h4 className="h5 fw-bold mb-1">For Students</h4>
                              <p className="small opacity-75 mb-0">Find opportunities that match your skills</p>
                            </div>
                          </div>
                          
                          <div className="d-flex align-items-center">
                            <div className="icon-circle me-3" style={{background: 'rgba(255,255,255,0.2)'}}>
                              <FaBuilding />
                            </div>
                            <div>
                              <h4 className="h5 fw-bold mb-1">For Companies</h4>
                              <p className="small opacity-75 mb-0">Discover talented professionals</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white bg-opacity-10 p-4 rounded">
                          <FaInfoCircle className="mb-2" />
                          <p className="small mb-0">
                            Join our professional network connecting students with companies across Lesotho
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <p className="small opacity-75 mb-0">
                          © {new Date().getFullYear()} Career Connect Lesotho. All rights reserved.
                        </p>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right Side - Registration Form */}
                <Col md={7}>
                  <Card.Body className="p-5">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <h3 className="h3 fw-bold text-dark mb-2">Create Account</h3>
                      <p className="text-muted">Join our professional community</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                      <Alert variant="success" className="d-flex align-items-center border-0 bg-success bg-opacity-10">
                        <FaCheckCircle className="me-2 text-success" />
                        {successMessage}
                      </Alert>
                    )}

                    {/* Account Type Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark mb-3">Select Account Type</label>
                      <div className="d-flex gap-3">
                        {userTypes.map((type) => (
                          <div
                            key={type.value}
                            className={`account-type-card flex-grow-1 text-center p-3 rounded-3 border cursor-pointer ${
                              formData.userType === type.value 
                                ? 'border-primary border-2' 
                                : 'border-light-subtle'
                            }`}
                            onClick={() => handleUserTypeSelect(type.value)}
                            style={{
                              background: formData.userType === type.value 
                                ? `${type.gradient}` 
                                : 'white',
                              color: formData.userType === type.value ? 'white' : 'inherit',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="mb-2">
                              <div className="icon-wrapper d-inline-flex align-items-center justify-content-center p-3 rounded-circle"
                                   style={{
                                     background: formData.userType === type.value 
                                       ? 'rgba(255,255,255,0.2)' 
                                       : `${type.gradient}`,
                                     width: '60px',
                                     height: '60px'
                                   }}>
                                {React.cloneElement(type.icon, {
                                  className: formData.userType === type.value 
                                    ? 'text-white' 
                                    : 'text-white'
                                })}
                              </div>
                            </div>
                            <h6 className="fw-bold mb-1">{type.label}</h6>
                            <p className="small mb-0 opacity-75">{type.description}</p>
                            {formData.userType === type.value && (
                              <div className="mt-2">
                                <span className="badge bg-white text-dark">Selected</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Registration Form */}
                    <Form onSubmit={handleManualRegistration} className="mt-4">
                      <div className="row g-3">
                        {/* Full Name */}
                        <div className="col-12">
                          <Form.Group>
                            <Form.Label className="form-label fw-semibold text-dark">
                              <FaUser className="me-2 text-primary" />
                              Full Name
                            </Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <FaUser className="text-muted" />
                              </span>
                              <Form.Control
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                isInvalid={!!errors.fullName}
                                placeholder="Enter your full name"
                                disabled={isLoading || isGoogleLoading}
                                className="border-start-0 py-3"
                                autoComplete="name"
                              />
                            </div>
                            {errors.fullName && (
                              <Form.Text className="text-danger small">
                                {errors.fullName}
                              </Form.Text>
                            )}
                          </Form.Group>
                        </div>

                        {/* Email */}
                        <div className="col-12">
                          <Form.Group>
                            <Form.Label className="form-label fw-semibold text-dark">
                              <FaEnvelope className="me-2 text-primary" />
                              Email Address
                            </Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <FaEnvelope className="text-muted" />
                              </span>
                              <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={!!errors.email}
                                placeholder="Enter your email"
                                disabled={isLoading || isGoogleLoading}
                                className="border-start-0 py-3"
                                autoComplete="email"
                              />
                            </div>
                            {errors.email && (
                              <Form.Text className="text-danger small">
                                {errors.email}
                              </Form.Text>
                            )}
                          </Form.Group>
                        </div>

                        {/* Password */}
                        <div className="col-12 col-md-6">
                          <Form.Group>
                            <Form.Label className="form-label fw-semibold text-dark">
                              <FaLock className="me-2 text-primary" />
                              Password
                            </Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <FaLock className="text-muted" />
                              </span>
                              <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                isInvalid={!!errors.password}
                                placeholder="Minimum 6 characters"
                                disabled={isLoading || isGoogleLoading}
                                className="border-start-0 py-3"
                                autoComplete="new-password"
                              />
                            </div>
                            {errors.password && (
                              <Form.Text className="text-danger small">
                                {errors.password}
                              </Form.Text>
                            )}
                          </Form.Group>
                        </div>

                        {/* Confirm Password */}
                        <div className="col-12 col-md-6">
                          <Form.Group>
                            <Form.Label className="form-label fw-semibold text-dark">
                              <FaLock className="me-2 text-primary" />
                              Confirm Password
                            </Form.Label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <FaLock className="text-muted" />
                              </span>
                              <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                isInvalid={!!errors.confirmPassword}
                                placeholder="Confirm your password"
                                disabled={isLoading || isGoogleLoading}
                                className="border-start-0 py-3"
                                autoComplete="new-password"
                              />
                            </div>
                            {errors.confirmPassword && (
                              <Form.Text className="text-danger small">
                                {errors.confirmPassword}
                              </Form.Text>
                            )}
                          </Form.Group>
                        </div>
                      </div>

                      {/* Submit Error */}
                      {errors.submit && (
                        <Alert variant="danger" className="mt-3 border-0 bg-danger bg-opacity-10">
                          {errors.submit}
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <div className="mt-4 pt-2">
                        <Button
                          variant="primary"
                          size="lg"
                          type="submit"
                          disabled={isLoading || isGoogleLoading}
                          className="w-100 py-3 fw-semibold"
                          style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none"
                          }}
                        >
                          {isLoading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Creating Account...
                            </>
                          ) : (
                            `Create ${formData.userType === 'company' ? 'Company' : 'Student'} Account`
                          )}
                        </Button>
                      </div>
                    </Form>

                    {/* Divider */}
                    <div className="position-relative text-center my-4">
                      <hr className="my-4" />
                      <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-semibold">
                        OR CONTINUE WITH
                      </span>
                    </div>

                    {/* Google Sign Up */}
                    <div className="mb-4">
                      <Button
                        variant="outline-dark"
                        size="lg"
                        className="w-100 py-3 fw-semibold"
                        onClick={handleGoogleRegistration}
                        disabled={isGoogleLoading || isLoading}
                      >
                        {isGoogleLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Connecting with Google...
                          </>
                        ) : (
                          <>
                            <FaGoogle className="me-2" />
                            Sign up with Google
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center pt-4 border-top">
                      <p className="text-muted mb-2">
                        Already have an account?
                      </p>
                      <Button 
                        variant="link" 
                        href="/login"
                        className="fw-semibold text-decoration-none"
                      >
                        Sign in to your account
                      </Button>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;