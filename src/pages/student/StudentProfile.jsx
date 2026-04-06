/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  ProgressBar,
  Badge,
  Modal,
  InputGroup,
  ListGroup,
  FloatingLabel,
  ToastContainer,
} from 'react-bootstrap';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiBriefcase,
  FiTool,
  FiAward,
  FiLinkedin,
  FiGithub,
  FiSave,
  FiEdit,
  FiUpload,
  FiDownload,
  FiEye,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiShare2,
  FiPlus,
  FiFileText,
  FiPercent,
  FiBriefcase as FiBriefcaseIcon,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineVisibility,
  MdOutlineCloudUpload,
} from 'react-icons/md';
import { FaGraduationCap, FaFilePdf, FaRegIdCard } from 'react-icons/fa';

import { useAuth, useStudent } from '../../context';
import { profileService } from '../../services/profileService';
import ProfilePhotoUpload from '../../components/profile/ProfilePhotoUpload';
import AutoSaveIndicator from '../../components/profile/AutoSaveIndicator';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useNotifications } from '../../hooks/useNotifications';
import './StudentProfile.css';

const StudentProfile = () => {
  const { currentUser } = useAuth();
  const { refreshData } = useStudent();
  const { showNotification } = useNotifications();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [errors, setErrors] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [activeSection, setActiveSection] = useState('personal'); // For mobile tabs

  // Refs
  const resumeInputRef = useRef(null);

  // Initialize auto-save
  const {
    isSaving: autoSaving,
    lastSaved,
    hasUnsavedChanges,
    manualSave,
    resetData,
  } = useAutoSave(null, {
    debounceTime: 2000,
    saveThreshold: 2,
    onSaveSuccess: async (data) => {
      if (currentUser?.uid && data) {
        const result = await profileService.updateProfile(currentUser.uid, data, {
          silent: true,
          validate: false,
        });
        if (result.success) {
          showNotification({
            type: 'success',
            title: 'Auto-saved',
            message: 'Profile auto-saved successfully',
            duration: 2000,
          });
          refreshData();
        }
      }
    },
  });

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);

      if (!currentUser?.uid) {
        throw new Error('Please login to view your profile');
      }

      const result = await profileService.fetchProfile(currentUser.uid, {
        cacheFirst: true,
        refresh: false,
      });

      if (result.success) {
        const data = result.data;
        setProfileData(data);

        // Calculate profile completion
        const completion = profileService.calculateProfileCompletion(data);
        setProfileCompletion(completion);
      } else {
        throw new Error(result.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification({
        type: 'error',
        title: 'Profile Error',
        message: error.message,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, showNotification]);

  // Initialize on mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Handle field updates
  const handleFieldChange = (field, value, isNested = false) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));

    if (isNested) {
      const [parent, child] = field.split('.');
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle profile photo update
  const handlePhotoUpdate = async (photoUrl) => {
    try {
      handleFieldChange('profilePhoto', photoUrl);
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Profile photo updated',
        duration: 3000,
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Upload Error',
        message: 'Failed to update profile photo',
        duration: 3000,
      });
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (file) => {
    if (!file || !currentUser?.uid) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await profileService.uploadResume(currentUser.uid, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        handleFieldChange('resumeUrl', result.url);
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Resume uploaded successfully',
          duration: 3000,
        });

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      showNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.message,
        duration: 3000,
      });
    }
  };

  // Handle skill operations
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    const currentSkills = profileData?.skills || [];
    const skill = newSkill.trim().toLowerCase();

    if (currentSkills.includes(skill)) {
      showNotification({
        type: 'warning',
        title: 'Duplicate',
        message: 'Skill already exists',
        duration: 2000,
      });
      return;
    }

    const updatedSkills = [...currentSkills, skill];
    handleFieldChange('skills', updatedSkills);
    setNewSkill('');
    showNotification({
      type: 'success',
      title: 'Added',
      message: 'Skill added successfully',
      duration: 2000,
    });
  };

  const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = profileData?.skills || [];
    const updatedSkills = currentSkills.filter((skill) => skill !== skillToRemove);
    handleFieldChange('skills', updatedSkills);
  };

  // Save profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Validate profile
      const validation = profileService.validateProfile(profileData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        showNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please fix the errors in the form',
          duration: 4000,
        });
        return;
      }

      const result = await profileService.updateProfile(currentUser.uid, profileData, {
        validate: false,
        updateAuth: true,
      });

      if (result.success) {
        resetData();
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Profile saved successfully',
          duration: 3000,
        });
        fetchProfileData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification({
        type: 'error',
        title: 'Save Failed',
        message: error.message,
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate profile completion breakdown
  const getCompletionBreakdown = () => {
    if (!profileData) return [];

    return [
      {
        label: 'Personal Info',
        completed: !!(profileData.fullName && profileData.email && profileData.studentId),
      },
      {
        label: 'Academic Details',
        completed: !!(profileData.institution && profileData.course && profileData.yearOfStudy),
      },
      { label: 'Contact Info', completed: !!(profileData.phone || profileData.address) },
      { label: 'Skills', completed: !!(profileData.skills && profileData.skills.length > 0) },
      { label: 'Resume', completed: !!profileData.resumeUrl },
      { label: 'Career Goals', completed: !!profileData.careerGoals },
    ];
  };

  // Render loading state
  if (loading) {
    return (
      <Container fluid className="profile-loading-container min-vh-100">
        <Row className="justify-content-center align-items-center h-100">
          <Col xs={12} className="text-center">
            <div className="spinner-container">
              <Spinner animation="border" variant="primary" className="spinner-large" />
              <h4 className="mt-4 text-primary">Loading your profile...</h4>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // Render error state
  if (!profileData) {
    return (
      <Container fluid className="profile-error-container min-vh-100">
        <Row className="justify-content-center align-items-center h-100">
          <Col md={6} className="text-center">
            <div className="error-card p-5 rounded-4 shadow-lg">
              <FiAlertCircle size={64} className="text-danger mb-4" />
              <h3 className="mb-3">Unable to Load Profile</h3>
              <p className="text-muted mb-4">Please try again later</p>
              <Button variant="primary" size="lg" onClick={fetchProfileData} className="px-4">
                <FiRefreshCw className="me-2" />
                Try Again
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  const completionBreakdown = getCompletionBreakdown();

  return (
    <Container fluid className="student-profile-container">
      <ToastContainer position="top-end" className="p-3" />

      {/* Header Section */}
      <div className="profile-header mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={4} lg={3}>
            <div className="profile-photo-section">
              <ProfilePhotoUpload
                userId={currentUser?.uid}
                currentPhoto={profileData?.profilePhoto}
                onPhotoUpdate={handlePhotoUpdate}
                size="xl"
                allowDelete={true}
                allowEdit={true}
                maxSize={5}
              />
            </div>
          </Col>
          <Col xs={12} md={8} lg={9}>
            <div className="profile-info-section">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h1 className="mb-1">{profileData?.fullName || 'Student'}</h1>
                  <p className="text-muted mb-2">
                    <FaRegIdCard className="me-2" />
                    {profileData?.studentId || 'No ID'} •
                    <FaGraduationCap className="ms-3 me-2" />
                    {profileData?.course || 'No course'} at{' '}
                    {profileData?.institution || 'No institution'}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <AutoSaveIndicator
                    isSaving={autoSaving}
                    lastSaved={lastSaved}
                    hasUnsavedChanges={hasUnsavedChanges}
                    compact={true}
                  />
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                  >
                    <FiShare2 />
                  </Button>
                </div>
              </div>

              <div className="profile-completion mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Profile Completion</span>
                  <strong>{profileCompletion}%</strong>
                </div>
                <ProgressBar
                  now={profileCompletion}
                  variant={
                    profileCompletion >= 80
                      ? 'success'
                      : profileCompletion >= 50
                        ? 'warning'
                        : 'danger'
                  }
                />
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  disabled={saving || !hasUnsavedChanges}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="me-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline-secondary" onClick={() => setShowExportModal(true)}>
                  <FiDownload className="me-2" />
                  Export
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Mobile Tabs */}
      <div className="d-md-none mb-4">
        <div className="mobile-tabs">
          {['personal', 'academic', 'skills', 'documents'].map((tab) => (
            <Button
              key={tab}
              variant={activeSection === tab ? 'primary' : 'outline-primary'}
              size="sm"
              className="me-2 mb-2"
              onClick={() => setActiveSection(tab)}
            >
              {tab === 'personal' && <FiUser className="me-1" />}
              {tab === 'academic' && <FaGraduationCap className="me-1" />}
              {tab === 'skills' && <FiTool className="me-1" />}
              {tab === 'documents' && <FiFileText className="me-1" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Row>
        {/* Left Column - Personal & Academic (Desktop) */}
        <Col lg={6} className="d-none d-lg-block">
          {/* Personal Information Card */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FiUser className="me-2" />
                Personal Information
              </h5>
              <MdOutlineEdit className="text-muted" />
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FloatingLabel label="Full Name">
                        <Form.Control
                          type="text"
                          value={profileData?.fullName || ''}
                          onChange={(e) => handleFieldChange('fullName', e.target.value)}
                          isInvalid={!!errors.fullName}
                        />
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FloatingLabel label="Email">
                        <Form.Control
                          type="email"
                          value={profileData?.email || ''}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          isInvalid={!!errors.email}
                        />
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FloatingLabel label="Phone">
                        <Form.Control
                          type="tel"
                          value={profileData?.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                        />
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FloatingLabel label="Student ID">
                        <Form.Control
                          type="text"
                          value={profileData?.studentId || ''}
                          onChange={(e) => handleFieldChange('studentId', e.target.value)}
                        />
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <FloatingLabel label="Bio / About Me">
                    <Form.Control
                      as="textarea"
                      style={{ height: '100px' }}
                      value={profileData?.bio || ''}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      maxLength={500}
                    />
                  </FloatingLabel>
                  <div className="text-end text-muted small">
                    {500 - (profileData?.bio?.length || 0)} characters remaining
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <FloatingLabel label="Career Goals">
                    <Form.Control
                      as="textarea"
                      style={{ height: '100px' }}
                      value={profileData?.careerGoals || ''}
                      onChange={(e) => handleFieldChange('careerGoals', e.target.value)}
                      maxLength={500}
                    />
                  </FloatingLabel>
                  <div className="text-end text-muted small">
                    {500 - (profileData?.careerGoals?.length || 0)} characters remaining
                  </div>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          {/* Academic Information Card */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaGraduationCap className="me-2" />
                Academic Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FloatingLabel label="Institution">
                        <Form.Control
                          type="text"
                          value={profileData?.institution || ''}
                          onChange={(e) => handleFieldChange('institution', e.target.value)}
                        />
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FloatingLabel label="Course">
                        <Form.Control
                          type="text"
                          value={profileData?.course || ''}
                          onChange={(e) => handleFieldChange('course', e.target.value)}
                        />
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FloatingLabel label="Year of Study">
                        <Form.Select
                          value={profileData?.yearOfStudy || ''}
                          onChange={(e) => handleFieldChange('yearOfStudy', e.target.value)}
                        >
                          <option value="">Select Year</option>
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                          <option value="5">Year 5</option>
                        </Form.Select>
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FloatingLabel label="Expected Graduation">
                        <Form.Control
                          type="month"
                          value={profileData?.graduationDate || ''}
                          onChange={(e) => handleFieldChange('graduationDate', e.target.value)}
                        />
                      </FloatingLabel>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <FloatingLabel label="Academic Achievements">
                    <Form.Control
                      as="textarea"
                      style={{ height: '100px' }}
                      value={profileData?.achievements || ''}
                      onChange={(e) => handleFieldChange('achievements', e.target.value)}
                    />
                  </FloatingLabel>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Skills & Documents (Desktop) */}
        <Col lg={6} className="d-none d-lg-block">
          {/* Skills Card */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FiTool className="me-2" />
                Skills & Competencies
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Add Skill */}
              <div className="mb-4">
                <h6>Add New Skill</h6>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Enter a skill (e.g., JavaScript, Python)"
                  />
                  <Button variant="primary" onClick={handleAddSkill}>
                    <FiPlus />
                  </Button>
                </InputGroup>
              </div>

              {/* Skills List */}
              <div className="mb-4">
                <h6>Your Skills ({profileData?.skills?.length || 0})</h6>
                {profileData?.skills && profileData.skills.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} bg="primary" className="p-2 d-flex align-items-center">
                        {skill}
                        <Button
                          variant="link"
                          className="text-white p-0 ms-2"
                          onClick={() => handleRemoveSkill(skill)}
                          style={{ fontSize: '12px' }}
                        >
                          <FiX />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No skills added yet</p>
                )}
              </div>

              <Form.Group className="mb-3">
                <FloatingLabel label="Technical Skills">
                  <Form.Control
                    as="textarea"
                    style={{ height: '100px' }}
                    value={profileData?.technicalSkills || ''}
                    onChange={(e) => handleFieldChange('technicalSkills', e.target.value)}
                  />
                </FloatingLabel>
              </Form.Group>

              <Form.Group>
                <FloatingLabel label="Certifications">
                  <Form.Control
                    as="textarea"
                    style={{ height: '80px' }}
                    value={profileData?.certifications || ''}
                    onChange={(e) => handleFieldChange('certifications', e.target.value)}
                  />
                </FloatingLabel>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Documents Card */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiFileText className="me-2" />
                Documents
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Resume Section */}
              <div className="mb-4">
                <h6>Resume</h6>
                {profileData?.resumeUrl ? (
                  <div className="resume-card p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <FaFilePdf size={24} className="text-danger me-3" />
                        <div>
                          <h6 className="mb-1">Current Resume</h6>
                          <small className="text-muted">
                            Uploaded:{' '}
                            {new Date(
                              profileData.resumeUploadedAt || Date.now()
                            ).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={profileData.resumeUrl}
                          target="_blank"
                        >
                          <FiEye className="me-1" />
                          View
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          href={profileData.resumeUrl}
                          download
                        >
                          <FiDownload className="me-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-100"
                      >
                        {isUploading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiUpload className="me-1" />
                            Replace Resume
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded">
                    <MdOutlineCloudUpload size={48} className="text-muted mb-3" />
                    <h5>No Resume Uploaded</h5>
                    <p className="text-muted mb-3">
                      Upload your resume to increase job match chances
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload className="me-2" />
                          Upload Resume
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={resumeInputRef}
                  className="d-none"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleResumeUpload(file);
                    e.target.value = '';
                  }}
                />
              </div>

              {/* Completion Breakdown */}
              <div>
                <h6>Profile Checklist</h6>
                <ListGroup variant="flush">
                  {completionBreakdown.map((item, index) => (
                    <ListGroup.Item
                      key={index}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>{item.label}</span>
                      {item.completed ? (
                        <FiCheckCircle className="text-success" />
                      ) : (
                        <FiAlertCircle className="text-warning" />
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Mobile View - Single Column */}
        <Col xs={12} className="d-lg-none">
          {(activeSection === 'personal' || window.innerWidth >= 992) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FiUser className="me-2" />
                  Personal Information
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Simplified mobile form - only essential fields */}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData?.fullName || ''}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    />
                  </Form.Group>

                  <Row>
                    <Col xs={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={profileData?.email || ''}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          value={profileData?.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={profileData?.bio || ''}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                    />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          )}

          {(activeSection === 'academic' || window.innerWidth >= 992) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaGraduationCap className="me-2" />
                  Academic Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Institution</Form.Label>
                    <Form.Control
                      type="text"
                      value={profileData?.institution || ''}
                      onChange={(e) => handleFieldChange('institution', e.target.value)}
                    />
                  </Form.Group>

                  <Row>
                    <Col xs={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Course</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData?.course || ''}
                          onChange={(e) => handleFieldChange('course', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Year</Form.Label>
                        <Form.Select
                          value={profileData?.yearOfStudy || ''}
                          onChange={(e) => handleFieldChange('yearOfStudy', e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          )}

          {(activeSection === 'skills' || window.innerWidth >= 992) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FiTool className="me-2" />
                  Skills
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Add Skill */}
                <div className="mb-3">
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                    />
                    <Button variant="primary" onClick={handleAddSkill}>
                      <FiPlus />
                    </Button>
                  </InputGroup>
                </div>

                {/* Skills List */}
                <div className="d-flex flex-wrap gap-2">
                  {profileData?.skills?.map((skill, index) => (
                    <Badge key={index} bg="primary" className="p-2 d-flex align-items-center">
                      {skill}
                      <Button
                        variant="link"
                        className="text-white p-0 ms-2"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{ fontSize: '12px' }}
                      >
                        <FiX />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {(activeSection === 'documents' || window.innerWidth >= 992) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FiFileText className="me-2" />
                  Documents
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Resume Section */}
                <div className="text-center">
                  {profileData?.resumeUrl ? (
                    <div>
                      <FaFilePdf size={48} className="text-danger mb-3" />
                      <h6>Resume Uploaded</h6>
                      <div className="d-flex gap-2 justify-content-center mt-3">
                        <Button
                          variant="outline-primary"
                          href={profileData.resumeUrl}
                          target="_blank"
                        >
                          <FiEye className="me-1" />
                          View
                        </Button>
                        <Button variant="outline-success" href={profileData.resumeUrl} download>
                          <FiDownload className="me-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <MdOutlineCloudUpload size={48} className="text-muted mb-3" />
                      <h6>No Resume</h6>
                      <Button
                        variant="primary"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={isUploading}
                        className="mt-2"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Resume'}
                      </Button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={resumeInputRef}
                    className="d-none"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleResumeUpload(file);
                      e.target.value = '';
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modals */}
      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Share Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            <Button
              variant="outline-dark"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/profile/${currentUser?.uid}`
                );
                showNotification({
                  type: 'success',
                  title: 'Copied',
                  message: 'Profile link copied to clipboard',
                  duration: 2000,
                });
                setShowShareModal(false);
              }}
            >
              <FiShare2 className="me-2" />
              Copy Profile Link
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => {
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/profile/' + currentUser?.uid)}`,
                  '_blank'
                );
                setShowShareModal(false);
              }}
            >
              <FiLinkedin className="me-2" />
              Share on LinkedIn
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">Choose export format:</p>
          <Form.Select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="mb-4"
          >
            <option value="pdf">PDF Document</option>
            <option value="json">JSON Data</option>
            <option value="docx">Word Document</option>
          </Form.Select>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // Simple export implementation
                const dataStr = JSON.stringify(profileData, null, 2);
                const dataUri =
                  'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                const exportFileDefaultName = `profile-${new Date().getTime()}.json`;

                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();

                showNotification({
                  type: 'success',
                  title: 'Exported',
                  message: 'Profile exported successfully',
                  duration: 2000,
                });
                setShowExportModal(false);
              }}
            >
              Export
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default StudentProfile;
