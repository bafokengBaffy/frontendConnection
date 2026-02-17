/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, 
  Alert, Spinner, Badge, ProgressBar,
  Accordion, Modal, OverlayTrigger, Tooltip,
  InputGroup, FormControl
} from 'react-bootstrap';
import {
  FaArrowLeft, FaSave, FaEye, FaCalendarAlt,
  FaMoneyBillWave, FaMapMarkerAlt, FaBriefcase,
  FaUsers, FaGraduationCap, FaFileAlt,
  FaTags, FaDollarSign, FaClock, FaCheckCircle,
  FaLightbulb, FaRocket, FaCloudUploadAlt,
  FaInfoCircle, FaTimes, FaPlus, FaTrash,
  FaMagic
} from 'react-icons/fa';
import { jobService, cloudinaryService } from '../../services/companyServices';
import './CreateNewJob.css';

const CreateNewJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  
  // Initialize form data with prefill from dashboard or saved draft
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    department: '',
    location: '',
    remote: false,
    hybrid: false,
    
    // Job Details
    type: 'full-time',
    experience: 'entry',
    
    // Salary as separate fields (not as an object)
    salary: '',
    salaryType: 'monthly',
    currency: 'M',
    salaryNegotiable: false,
    
    // Requirements & Skills
    description: '',
    responsibilities: '',
    requirements: '',
    qualifications: '',
    skills: [],
    newSkill: '',
    techStack: [],
    newTech: '',
    
    // Benefits & Perks
    benefits: [],
    newBenefit: '',
    
    // Application Details
    applicationDeadline: '',
    applicationInstructions: '',
    applicationQuestions: [],
    newQuestion: '',
    
    // Company Details (auto-filled)
    companyName: '',
    companyLogo: '',
    companyIndustry: '',
    
    // Job Settings
    status: 'draft',
    urgency: 'normal',
    visibility: 'public',
    autoClose: false,
    maxApplications: 0,
    
    // AI Enhancement
    aiEnhancedDescription: '',
    aiEnhancedSkills: [],
    
    // Metadata
    draftId: null,
    lastSaved: null,
    version: 1
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Load draft from localStorage or prefill from dashboard
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Check for prefill data from dashboard
        const prefillData = location.state?.prefill;
        const savedDraft = localStorage.getItem('jobDraft');
        
        let initialData = { ...formData };
        
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          // Handle both old and new salary format
          if (draft.salary && typeof draft.salary === 'object') {
            // Convert old object format to new separate fields
            initialData = {
              ...initialData,
              ...draft,
              salary: draft.salary.amount || '',
              salaryType: draft.salary.type || 'monthly',
              currency: draft.salary.currency || 'M',
              salaryNegotiable: draft.salary.negotiable || false
            };
            // Remove the old salary object
            delete initialData.salary;
          } else {
            initialData = { ...initialData, ...draft };
          }
          setDraftSaved(true);
        }
        
        if (prefillData) {
          initialData = {
            ...initialData,
            title: prefillData.title || '',
            department: prefillData.department || '',
            location: prefillData.location || '',
            type: prefillData.type || 'full-time',
            experience: prefillData.experience || 'entry',
            salary: prefillData.salary || ''
          };
        }
        
        // Get company info
        const companyProfile = await import('../../services/companyServices').then(
          module => module.companyService.getCompanyProfile()
        ).catch(() => null);
        
        if (companyProfile) {
          initialData.companyName = companyProfile.name || '';
          initialData.companyLogo = companyProfile.logo || '';
          initialData.companyIndustry = companyProfile.industry || '';
        }
        
        setFormData(initialData);
        
        // Setup auto-save
        const timer = setInterval(() => {
          if (initialData.title || initialData.description) {
            handleAutoSave();
          }
        }, 30000); // Auto-save every 30 seconds
        
        setAutoSaveTimer(timer);
        
        return () => clearInterval(timer);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Auto-save function
  const handleAutoSave = () => {
    if (!formData.title && !formData.description) return;
    
    const draft = {
      ...formData,
      lastSaved: new Date().toISOString(),
      status: 'draft'
    };
    
    localStorage.setItem('jobDraft', JSON.stringify(draft));
    setDraftSaved(true);
    
    // Show auto-save notification
    setSaveStatus({
      type: 'info',
      message: 'Auto-saved as draft',
      show: true
    });
    
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Trigger auto-save on important fields
    if (['title', 'description', 'responsibilities', 'requirements'].includes(name)) {
      clearTimeout(autoSaveTimer);
      const timer = setTimeout(handleAutoSave, 3000);
      setAutoSaveTimer(timer);
    }
  };

  // Handle array field additions
  const handleAddItem = (field, valueField, item) => {
    if (!item.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], item.trim()],
      [valueField]: ''
    }));
  };

  // Handle array field removals
  const handleRemoveItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Move to next step
  const nextStep = () => {
    // Validate current step
    const errors = validateStep(formStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setFormStep(prev => Math.min(prev + 1, 5));
    window.scrollTo(0, 0);
  };

  // Move to previous step
  const prevStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1: { // Basic Information
        if (!formData.title.trim()) errors.title = 'Job title is required';
        if (!formData.location.trim()) errors.location = 'Location is required';
        break;
      }
        
      case 2: { // Job Details
        if (!formData.description.trim()) errors.description = 'Job description is required';
        if (!formData.responsibilities.trim()) errors.responsibilities = 'Responsibilities are required';
        break;
      }
        
      case 3: { // Requirements
        if (formData.skills.length === 0) errors.skills = 'At least one skill is required';
        break;
      }
        
      case 4: { // Benefits & Application
        if (!formData.applicationDeadline) errors.applicationDeadline = 'Application deadline is required';
        const deadline = new Date(formData.applicationDeadline);
        if (deadline < new Date()) errors.applicationDeadline = 'Deadline must be in the future';
        break;
      }
    }
    
    return errors;
  };

  // Validate entire form
  const validateForm = () => {
    const stepErrors = [
      validateStep(1),
      validateStep(2),
      validateStep(3),
      validateStep(4)
    ];
    
    const allErrors = stepErrors.reduce((acc, errors) => ({ ...acc, ...errors }), {});
    setValidationErrors(allErrors);
    
    return Object.keys(allErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (publish = false) => {
    try {
      if (!validateForm()) {
        setSaveStatus({
          type: 'danger',
          message: 'Please fix the errors in the form before submitting',
          show: true
        });
        return;
      }
      
      setLoading(true);
      
      // Prepare job data for Firebase
      const jobData = {
        // Basic Information
        title: formData.title,
        department: formData.department,
        location: formData.location,
        remote: formData.remote,
        hybrid: formData.hybrid,
        
        // Job Details
        type: formData.type,
        experience: formData.experience,
        
        // Salary as separate fields
        salary: formData.salary,
        salaryType: formData.salaryType,
        currency: formData.currency,
        salaryNegotiable: formData.salaryNegotiable,
        
        // Requirements & Skills
        description: formData.description,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
        qualifications: formData.qualifications,
        skills: formData.skills,
        techStack: formData.techStack,
        
        // Benefits & Perks
        benefits: formData.benefits,
        
        // Application Details
        applicationDeadline: formData.applicationDeadline,
        applicationInstructions: formData.applicationInstructions,
        applicationQuestions: formData.applicationQuestions,
        
        // Job Settings
        status: publish ? 'active' : 'draft',
        urgency: formData.urgency,
        visibility: formData.visibility,
        autoClose: formData.autoClose,
        maxApplications: formData.maxApplications || 0,
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        applicantsCount: 0,
        views: 0,
        isActive: publish,
        
        // Company info
        companyName: formData.companyName,
        companyLogo: formData.companyLogo,
        companyIndustry: formData.companyIndustry
      };
      
      // Save to Firebase
      const jobId = await jobService.createJob(jobData);
      
      // Clear draft from localStorage
      localStorage.removeItem('jobDraft');
      
      setSaveStatus({
        type: 'success',
        message: publish 
          ? `Job "${formData.title}" published successfully!` 
          : `Job "${formData.title}" saved as draft.`,
        show: true,
        jobId
      });
      
      setTimeout(() => {
        if (publish) {
          navigate(`/company/jobs/${jobId}`);
        } else {
          navigate('/company/jobs');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error saving job:', error);
      setSaveStatus({
        type: 'danger',
        message: `Failed to save job: ${error.message}`,
        show: true
      });
    } finally {
      setLoading(false);
    }
  };

  // AI Enhancement feature
  const enhanceWithAI = async (field) => {
    try {
      // This would call your AI service
      // For now, mock the response
      setLoading(true);
      
      setTimeout(() => {
        if (field === 'description') {
          setFormData(prev => ({
            ...prev,
            aiEnhancedDescription: `We are seeking a talented ${formData.title} to join our dynamic team. As a key member of our ${formData.department} department, you will be responsible for ${formData.responsibilities.slice(0, 100)}...`
          }));
        } else if (field === 'skills') {
          setFormData(prev => ({
            ...prev,
            aiEnhancedSkills: ['Teamwork', 'Communication', 'Problem Solving', 'Time Management']
          }));
        }
        
        setLoading(false);
        setSaveStatus({
          type: 'success',
          message: 'AI enhancement applied!',
          show: true
        });
      }, 1500);
    } catch (error) {
      console.error('AI enhancement failed:', error);
      setLoading(false);
    }
  };

  // Apply AI enhancements
  const applyAIEnhancements = () => {
    if (formData.aiEnhancedDescription) {
      setFormData(prev => ({
        ...prev,
        description: prev.aiEnhancedDescription
      }));
    }
    
    if (formData.aiEnhancedSkills.length > 0) {
      setFormData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...prev.aiEnhancedSkills])]
      }));
    }
    
    setSaveStatus({
      type: 'info',
      message: 'AI enhancements applied to form',
      show: true
    });
  };

  // Progress calculation
  const calculateProgress = () => {
    const fields = [
      'title', 'location', 'description', 'responsibilities',
      'skills', 'applicationDeadline'
    ];
    
    const filledFields = fields.filter(field => {
      const value = formData[field];
      if (Array.isArray(value)) return value.length > 0;
      return value && value.toString().trim().length > 0;
    });
    
    return Math.round((filledFields.length / fields.length) * 100);
  };

  // Format salary display for preview
  const formatSalary = () => {
    if (!formData.salary) return 'Not specified';
    
    const typeMap = {
      'monthly': 'per month',
      'yearly': 'per year',
      'hourly': 'per hour'
    };
    
    return `${formData.currency}${formData.salary} ${typeMap[formData.salaryType] || formData.salaryType}`;
  };

  // Render step 1: Basic Information
  const renderStep1 = () => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-0 py-3">
        <h5 className="mb-0 d-flex align-items-center">
          <FaBriefcase className="me-2 text-primary" />
          Basic Information
        </h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Job Title <span className="text-danger">*</span>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Enter a clear, descriptive job title</Tooltip>}
                >
                  <FaInfoCircle className="ms-2 text-muted" size={14} />
                </OverlayTrigger>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Software Engineer"
                isInvalid={!!validationErrors.title}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.title}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Department</Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Engineering"
                className="py-2"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Location <span className="text-danger">*</span>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Specify where the job is based</Tooltip>}
                >
                  <FaInfoCircle className="ms-2 text-muted" size={14} />
                </OverlayTrigger>
              </Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Maseru, Lesotho or Remote"
                isInvalid={!!validationErrors.location}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.location}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Work Arrangement</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="checkbox"
                  id="remote"
                  label={
                    <span className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" /> Remote
                    </span>
                  }
                  checked={formData.remote}
                  onChange={(e) => setFormData(prev => ({ ...prev, remote: e.target.checked }))}
                />
                <Form.Check
                  type="checkbox"
                  id="hybrid"
                  label={
                    <span className="d-flex align-items-center">
                      <FaBriefcase className="me-2" /> Hybrid
                    </span>
                  }
                  checked={formData.hybrid}
                  onChange={(e) => setFormData(prev => ({ ...prev, hybrid: e.target.checked }))}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Job Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="py-2"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
                <option value="volunteer">Volunteer</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Experience Level</Form.Label>
              <Form.Select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="py-2"
              >
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6+ years)</option>
                <option value="lead">Lead / Manager</option>
                <option value="executive">Executive</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Render step 2: Job Details
  const renderStep2 = () => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-0 py-3">
        <h5 className="mb-0 d-flex align-items-center">
          <FaFileAlt className="me-2 text-primary" />
          Job Details
        </h5>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="fw-semibold">
              Job Description <span className="text-danger">*</span>
            </Form.Label>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => enhanceWithAI('description')}
              disabled={loading}
            >
              <FaMagic className="me-2" />
              Enhance with AI
            </Button>
          </div>
          <Form.Control
            as="textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the role, team, and impact..."
            rows={6}
            isInvalid={!!validationErrors.description}
            className="py-2"
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.description}
          </Form.Control.Feedback>
          {formData.aiEnhancedDescription && (
            <Alert variant="info" className="mt-2">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>AI Enhanced Description:</strong>
                  <p className="mb-0 mt-1">{formData.aiEnhancedDescription}</p>
                </div>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, description: prev.aiEnhancedDescription }))}
                >
                  Use This
                </Button>
              </div>
            </Alert>
          )}
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            Key Responsibilities <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleInputChange}
            placeholder="List the main responsibilities and duties..."
            rows={4}
            isInvalid={!!validationErrors.responsibilities}
            className="py-2"
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.responsibilities}
          </Form.Control.Feedback>
        </Form.Group>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Requirements</Form.Label>
              <Form.Control
                as="textarea"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Required skills and capabilities..."
                rows={4}
                className="py-2"
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Qualifications</Form.Label>
              <Form.Control
                as="textarea"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="Educational and professional qualifications..."
                rows={4}
                className="py-2"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Salary Range</Form.Label>
              <InputGroup>
                <InputGroup.Text>{formData.currency}</InputGroup.Text>
                <FormControl
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g., 10,000 - 15,000"
                  className="py-2"
                />
                <Form.Select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleInputChange}
                  style={{ maxWidth: '120px' }}
                  className="py-2"
                >
                  <option value="monthly">per month</option>
                  <option value="yearly">per year</option>
                  <option value="hourly">per hour</option>
                </Form.Select>
              </InputGroup>
              <Form.Check
                type="checkbox"
                id="salaryNegotiable"
                label="Salary is negotiable"
                checked={formData.salaryNegotiable}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryNegotiable: e.target.checked }))}
                className="mt-2"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Render step 3: Requirements & Skills
  const renderStep3 = () => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-0 py-3">
        <h5 className="mb-0 d-flex align-items-center">
          <FaTags className="me-2 text-primary" />
          Requirements & Skills
        </h5>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="fw-semibold">
              Required Skills <span className="text-danger">*</span>
            </Form.Label>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => enhanceWithAI('skills')}
              disabled={loading}
            >
              <FaMagic className="me-2" />
              AI Suggest Skills
            </Button>
          </div>
          <div className="mb-3">
            <InputGroup>
              <FormControl
                type="text"
                value={formData.newSkill}
                onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))}
                placeholder="e.g., JavaScript, React, Project Management"
                className="py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('skills', 'newSkill', formData.newSkill);
                  }
                }}
              />
              <Button
                variant="primary"
                onClick={() => handleAddItem('skills', 'newSkill', formData.newSkill)}
              >
                <FaPlus />
              </Button>
            </InputGroup>
            {validationErrors.skills && (
              <div className="text-danger small mt-1">{validationErrors.skills}</div>
            )}
          </div>
          
          {formData.skills.length > 0 ? (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {formData.skills.map((skill, index) => (
                <Badge key={index} bg="primary" className="p-2 d-flex align-items-center">
                  {skill}
                  <Button
                    variant="link"
                    className="p-0 ms-2 text-white"
                    onClick={() => handleRemoveItem('skills', index)}
                    style={{ minWidth: 'auto' }}
                  >
                    <FaTimes size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <Alert variant="warning">
              Add at least one required skill for this position
            </Alert>
          )}
          
          {formData.aiEnhancedSkills.length > 0 && (
            <Alert variant="info">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>AI Suggested Skills:</strong>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {formData.aiEnhancedSkills.map((skill, index) => (
                      <Badge key={index} bg="info" className="p-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      skills: [...new Set([...prev.skills, ...prev.aiEnhancedSkills])]
                    }));
                  }}
                >
                  Add All
                </Button>
              </div>
            </Alert>
          )}
        </Form.Group>
        
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Technology Stack</Form.Label>
          <div className="mb-3">
            <InputGroup>
              <FormControl
                type="text"
                value={formData.newTech}
                onChange={(e) => setFormData(prev => ({ ...prev, newTech: e.target.value }))}
                placeholder="e.g., Node.js, MongoDB, AWS"
                className="py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('techStack', 'newTech', formData.newTech);
                  }
                }}
              />
              <Button
                variant="outline-primary"
                onClick={() => handleAddItem('techStack', 'newTech', formData.newTech)}
              >
                <FaPlus />
              </Button>
            </InputGroup>
          </div>
          
          {formData.techStack.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {formData.techStack.map((tech, index) => (
                <Badge key={index} bg="secondary" className="p-2 d-flex align-items-center">
                  {tech}
                  <Button
                    variant="link"
                    className="p-0 ms-2 text-white"
                    onClick={() => handleRemoveItem('techStack', index)}
                    style={{ minWidth: 'auto' }}
                  >
                    <FaTimes size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </Form.Group>
      </Card.Body>
    </Card>
  );

  // Render step 4: Benefits & Application
  const renderStep4 = () => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-0 py-3">
        <h5 className="mb-0 d-flex align-items-center">
          <FaUsers className="me-2 text-primary" />
          Benefits & Application
        </h5>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Benefits & Perks</Form.Label>
          <div className="mb-3">
            <InputGroup>
              <FormControl
                type="text"
                value={formData.newBenefit}
                onChange={(e) => setFormData(prev => ({ ...prev, newBenefit: e.target.value }))}
                placeholder="e.g., Health insurance, Remote work, Professional development"
                className="py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('benefits', 'newBenefit', formData.newBenefit);
                  }
                }}
              />
              <Button
                variant="outline-primary"
                onClick={() => handleAddItem('benefits', 'newBenefit', formData.newBenefit)}
              >
                <FaPlus />
              </Button>
            </InputGroup>
          </div>
          
          {formData.benefits.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {formData.benefits.map((benefit, index) => (
                <Badge key={index} bg="success" className="p-2 d-flex align-items-center">
                  <FaCheckCircle className="me-2" />
                  {benefit}
                  <Button
                    variant="link"
                    className="p-0 ms-2 text-white"
                    onClick={() => handleRemoveItem('benefits', index)}
                    style={{ minWidth: 'auto' }}
                  >
                    <FaTimes size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </Form.Group>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Application Deadline <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.applicationDeadline}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.applicationDeadline}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Max Applications (Optional)</Form.Label>
              <Form.Control
                type="number"
                name="maxApplications"
                value={formData.maxApplications}
                onChange={handleInputChange}
                placeholder="0 = unlimited"
                min="0"
                className="py-2"
              />
              <Form.Check
                type="checkbox"
                id="autoClose"
                label="Auto-close when max applications reached"
                checked={formData.autoClose}
                onChange={(e) => setFormData(prev => ({ ...prev, autoClose: e.target.checked }))}
                className="mt-2"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Application Instructions</Form.Label>
          <Form.Control
            as="textarea"
            name="applicationInstructions"
            value={formData.applicationInstructions}
            onChange={handleInputChange}
            placeholder="Additional instructions for applicants..."
            rows={3}
            className="py-2"
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Application Questions</Form.Label>
          <div className="mb-3">
            <InputGroup>
              <FormControl
                type="text"
                value={formData.newQuestion}
                onChange={(e) => setFormData(prev => ({ ...prev, newQuestion: e.target.value }))}
                placeholder="e.g., Why are you interested in this role?"
                className="py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('applicationQuestions', 'newQuestion', formData.newQuestion);
                  }
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => handleAddItem('applicationQuestions', 'newQuestion', formData.newQuestion)}
              >
                <FaPlus />
              </Button>
            </InputGroup>
          </div>
          
          {formData.applicationQuestions.length > 0 && (
            <div className="border rounded p-3">
              <h6 className="mb-3">Questions for Applicants:</h6>
              {formData.applicationQuestions.map((question, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                  <span>{question}</span>
                  <Button
                    variant="link"
                    className="text-danger p-0"
                    onClick={() => handleRemoveItem('applicationQuestions', index)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Form.Group>
      </Card.Body>
    </Card>
  );

  // Render step 5: Review & Publish
  const renderStep5 = () => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-0 py-3">
        <h5 className="mb-0 d-flex align-items-center">
          <FaEye className="me-2 text-primary" />
          Review & Publish
        </h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={8}>
            <div className="job-preview p-4 border rounded">
              <div className="d-flex align-items-center mb-4">
                {formData.companyLogo && (
                  <img
                    src={formData.companyLogo}
                    alt={formData.companyName}
                    className="rounded me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <h3 className="mb-1">{formData.title}</h3>
                  <p className="text-muted mb-0">
                    {formData.companyName} • {formData.location}
                    {formData.remote && ' • Remote'}
                    {formData.hybrid && ' • Hybrid'}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-2">Job Details</h5>
                <Row>
                  <Col md={6}>
                    <p><strong>Type:</strong> {formData.type}</p>
                    <p><strong>Experience:</strong> {formData.experience}</p>
                    <p><strong>Department:</strong> {formData.department}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Salary:</strong> {formatSalary()}</p>
                    <p><strong>Deadline:</strong> {formData.applicationDeadline || 'Not set'}</p>
                  </Col>
                </Row>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-2">Description</h5>
                <p style={{ whiteSpace: 'pre-wrap' }}>{formData.description}</p>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="mb-4">
                  <h5 className="mb-2">Required Skills</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} bg="primary" className="p-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.benefits.length > 0 && (
                <div className="mb-4">
                  <h5 className="mb-2">Benefits</h5>
                  <ul className="list-unstyled">
                    {formData.benefits.map((benefit, index) => (
                      <li key={index} className="mb-1">
                        <FaCheckCircle className="text-success me-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Col>
          
          <Col md={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="mb-3">Publish Settings</h6>
                
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Job Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mb-3"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="active">Publish Now</option>
                    <option value="paused">Pause (Don&apos;t Accept Applications)</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Urgency Level</Form.Label>
                  <Form.Select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="mb-3"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Visibility</Form.Label>
                  <Form.Select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="mb-3"
                  >
                    <option value="public">Public (All Users)</option>
                    <option value="internal">Internal Only</option>
                    <option value="unlisted">Unlisted (Link Only)</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="border-top pt-3 mt-3">
                  <h6 className="mb-2">Job Summary</h6>
                  <div className="small text-muted">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Progress:</span>
                      <span>{calculateProgress()}%</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Skills:</span>
                      <span>{formData.skills.length}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Benefits:</span>
                      <span>{formData.benefits.length}</span>
                    </div>
                    {draftSaved && (
                      <div className="text-info mt-2">
                        <FaSave className="me-1" />
                        Draft auto-saved
                      </div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Render progress indicator
  const renderProgress = () => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <h5 className="mb-0">Create New Job Posting</h5>
            <p className="text-muted mb-0 small">
              Step {formStep} of 5 • {calculateProgress()}% complete
            </p>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate('/company/jobs')}
          >
            <FaArrowLeft className="me-2" />
            Back to Jobs
          </Button>
        </div>
        
        <ProgressBar
          now={calculateProgress()}
          variant="primary"
          className="mb-3"
          style={{ height: '8px' }}
        />
        
        <div className="d-flex justify-content-between">
          {['Basic Info', 'Job Details', 'Requirements', 'Benefits', 'Review'].map((step, index) => (
            <div
              key={index}
              className={`text-center ${index + 1 <= formStep ? 'text-primary fw-semibold' : 'text-muted'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setFormStep(index + 1)}
            >
              <div className={`rounded-circle mb-1 ${index + 1 <= formStep ? 'bg-primary text-white' : 'bg-light'} d-inline-flex align-items-center justify-content-center`}
                   style={{ width: '30px', height: '30px' }}>
                {index + 1}
              </div>
              <div className="small">{step}</div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="create-job-container px-4 py-3">
      {/* Header */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 fw-bold">
                <FaRocket className="me-2 text-primary" />
                Create New Job
              </h1>
              <p className="text-muted mb-0">
                Fill out the details below to create an appealing job posting
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setShowPreview(true)}
              >
                <FaEye className="me-2" />
                Preview
              </Button>
              {formData.aiEnhancedDescription && (
                <Button
                  variant="success"
                  onClick={applyAIEnhancements}
                >
                  <FaMagic className="me-2" />
                  Apply AI Enhancements
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Save Status Alert */}
      {saveStatus?.show && (
        <Row className="mb-3">
          <Col>
            <Alert 
              variant={saveStatus.type} 
              onClose={() => setSaveStatus(null)} 
              dismissible
              className="mb-0"
            >
              {saveStatus.message}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Progress Bar */}
      {renderProgress()}

      {/* Form Steps */}
      <Row>
        <Col>
          {formStep === 1 && renderStep1()}
          {formStep === 2 && renderStep2()}
          {formStep === 3 && renderStep3()}
          {formStep === 4 && renderStep4()}
          {formStep === 5 && renderStep5()}
        </Col>
      </Row>

      {/* Navigation Buttons */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between">
                <div>
                  {formStep > 1 && (
                    <Button variant="outline-secondary" onClick={prevStep}>
                      <FaArrowLeft className="me-2" />
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="d-flex gap-3">
                  <Button
                    variant="light"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save as Draft
                      </>
                    )}
                  </Button>
                  
                  {formStep < 5 ? (
                    <Button variant="primary" onClick={nextStep}>
                      Continue
                      <FaArrowLeft className="ms-2" style={{ transform: 'rotate(180deg)' }} />
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <FaRocket className="me-2" />
                          Publish Job
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Job Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="job-preview-content">
            <div className="text-center mb-4">
              <h2>Preview: {formData.title}</h2>
              <p className="text-muted">This is how candidates will see your job posting</p>
            </div>
            
            <Card className="border-0 shadow">
              <Card.Body className="p-4">
                {/* Preview content similar to renderStep5 */}
                {renderStep5()}
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close Preview
          </Button>
          <Button variant="primary" onClick={() => setShowPreview(false)}>
            Continue Editing
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3">Processing your job posting...</p>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CreateNewJob;