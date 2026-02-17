/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Table,
  ProgressBar, Modal, Form, Alert, Spinner, Dropdown
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, getDocs,
  addDoc, updateDoc, deleteDoc, doc, getDoc,
  onSnapshot, serverTimestamp, Timestamp, limit
} from 'firebase/firestore';
import { db, storage, auth } from '../../config/firebase';
import { useNotification } from '../../context/NotificationContext';
import { uploadFile  } from '../../services/cloudinaryService';

// Constants
const COLLECTIONS = {
  SAVED_JOBS: 'savedJobs',
  JOB_APPLICATIONS: 'jobApplications',
  JOBS: 'jobs',
  USER_PROFILES: 'userProfiles',
  USER_DOCUMENTS: 'userDocuments'
};

const STATUS_CONFIG = {
  application_received: { variant: 'secondary', label: 'Application Received' },
  under_review: { variant: 'warning', label: 'Under Review' },
  interview_scheduled: { variant: 'info', label: 'Interview Scheduled' },
  assessment_pending: { variant: 'primary', label: 'Assessment Pending' },
  accepted: { variant: 'success', label: 'Accepted' },
  rejected: { variant: 'danger', label: 'Rejected' }
};

const EDUCATION_LEVELS = ['high_school', 'diploma', 'bachelor', 'master', 'phd'];
const VALID_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_APPLICATIONS_DISPLAY = 5;

// Helper Functions
const safeNotification = (notificationContext, message, type = 'info') => {
  if (notificationContext?.showNotification) {
    notificationContext.showNotification(message, type);
  } else {
    console[type === 'error' ? 'error' : 'log'](`Notification: ${message}`);
  }
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    let dateObj;
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date?.toDate) {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const calculateMatchScore = (job, profile) => {
  if (!profile) return 75;

  let score = 50;
  const jobSkills = job.jobDetails?.requiredSkills || [];
  const userSkills = profile.skills || [];

  // Skill matching
  const matchedSkills = userSkills.filter(skill =>
    jobSkills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );

  if (jobSkills.length > 0) {
    score += (matchedSkills.length / jobSkills.length) * 30;
  }

  // Education level matching
  if (job.jobDetails?.minEducation && profile.educationLevel) {
    const jobLevelIndex = EDUCATION_LEVELS.indexOf(job.jobDetails.minEducation);
    const userLevelIndex = EDUCATION_LEVELS.indexOf(profile.educationLevel);

    if (userLevelIndex >= jobLevelIndex) {
      score += 15;
    }
  }

  // Experience matching
  if (job.jobDetails?.minExperience && profile.yearsOfExperience) {
    if (profile.yearsOfExperience >= job.jobDetails.minExperience) {
      score += 5;
    }
  }

  return Math.min(Math.round(score), 95);
};

const validateFile = (file) => {
  if (!VALID_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload PDF or Word documents only (PDF, DOC, DOCX)' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size should be less than 5MB' };
  }

  return { valid: true };
};

// Main Component
const Jobs = () => {
  const navigate = useNavigate();
  const notificationContext = useNotification();
  const unsubscribeRef = useRef(null);
  
  // State Management
  const [loading, setLoading] = useState({
    savedJobs: true,
    appliedJobs: true,
    stats: true,
    profile: true
  });
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applicationStats, setApplicationStats] = useState({
    active: 0,
    pending: 0,
    rejected: 0,
    accepted: 0,
    total: 0
  });
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [activeResume, setActiveResume] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Memoized values
  const userId = useMemo(() => auth.currentUser?.uid, []);
  const userEmail = useMemo(() => auth.currentUser?.email, []);

  // Cleanup listener on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current && typeof unsubscribeRef.current === 'function') {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Fetch User Profile and Resume
  const fetchUserProfile = useCallback(async () => {
    try {
      if (!userId) {
        setLoading(prev => ({ ...prev, profile: false }));
        return;
      }

      setLoading(prev => ({ ...prev, profile: true }));
      
      // Fetch user profile
      const profileDoc = await getDoc(doc(db, COLLECTIONS.USER_PROFILES, userId));
      if (profileDoc.exists()) {
        setUserProfile({ id: profileDoc.id, ...profileDoc.data() });
      } else {
        console.warn('User profile not found');
      }

      // Fetch active resume
      const docsQuery = query(
        collection(db, COLLECTIONS.USER_DOCUMENTS),
        where('userId', '==', userId),
        where('documentType', '==', 'resume'),
        where('isActive', '==', true),
        orderBy('uploadedAt', 'desc'),
        limit(1)
      );
      
      const docsSnapshot = await getDocs(docsQuery);
      if (!docsSnapshot.empty) {
        const docData = docsSnapshot.docs[0].data();
        setActiveResume({
          id: docsSnapshot.docs[0].id,
          ...docData,
          uploadedAt: docData.uploadedAt?.toDate?.() || new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      safeNotification(notificationContext, 'Error loading profile information', 'error');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [userId, notificationContext]);

  // Initial data fetch
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch Saved Jobs
  const fetchSavedJobs = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, savedJobs: true }));
      if (!userId) {
        setLoading(prev => ({ ...prev, savedJobs: false }));
        return;
      }

      const savedJobsQuery = query(
        collection(db, COLLECTIONS.SAVED_JOBS),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('savedAt', 'desc'),
        limit(50) // Limit to prevent too many reads
      );

      const snapshot = await getDocs(savedJobsQuery);
      const jobs = [];
      
      for (const docSnap of snapshot.docs) {
        try {
          const savedJob = { id: docSnap.id, ...docSnap.data() };
          
          const jobDoc = await getDoc(doc(db, COLLECTIONS.JOBS, savedJob.jobId));
          if (jobDoc.exists()) {
            const jobData = jobDoc.data();
            jobs.push({
              ...savedJob,
              jobDetails: { 
                id: jobDoc.id, 
                ...jobData,
                deadline: jobData.deadline?.toDate?.()
              },
              savedDate: savedJob.savedAt?.toDate?.()
            });
          }
        } catch (error) {
          console.error('Error processing saved job:', error);
        }
      }

      setSavedJobs(jobs);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      safeNotification(notificationContext, 'Error loading saved jobs', 'error');
    } finally {
      setLoading(prev => ({ ...prev, savedJobs: false }));
    }
  }, [userId, notificationContext]);

  // Setup Applied Jobs Listener
  const setupAppliedJobsListener = useCallback(() => {
    if (!userId) return;

    try {
      // Clean up previous listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      const applicationsQuery = query(
        collection(db, COLLECTIONS.JOB_APPLICATIONS),
        where('studentId', '==', userId),
        orderBy('appliedAt', 'desc'),
        limit(100) // Limit to prevent too many reads
      );

      const unsubscribe = onSnapshot(
        applicationsQuery,
        async (snapshot) => {
          try {
            const applications = [];
            const stats = { active: 0, pending: 0, rejected: 0, accepted: 0, total: 0 };

            for (const docSnap of snapshot.docs) {
              try {
                const application = { id: docSnap.id, ...docSnap.data() };
                
                // Fetch job details for display
                let jobTitle = application.jobTitle;
                let companyName = application.companyName;
                
                if (!jobTitle || !companyName) {
                  const jobDoc = await getDoc(doc(db, COLLECTIONS.JOBS, application.jobId));
                  if (jobDoc.exists()) {
                    const jobData = jobDoc.data();
                    jobTitle = jobTitle || jobData.title;
                    companyName = companyName || jobData.company;
                  }
                }

                applications.push({
                  ...application,
                  jobTitle,
                  companyName,
                  appliedDate: application.appliedAt?.toDate?.(),
                  statusUpdated: application.statusUpdatedAt?.toDate?.()
                });

                stats.total++;
                switch (application.status) {
                  case 'under_review':
                  case 'interview_scheduled':
                  case 'assessment_pending':
                    stats.active++;
                    break;
                  case 'application_received':
                    stats.pending++;
                    break;
                  case 'rejected':
                    stats.rejected++;
                    break;
                  case 'accepted':
                    stats.accepted++;
                    break;
                  default:
                    stats.pending++;
                }
              } catch (error) {
                console.error('Error processing application:', error);
              }
            }

            setAppliedJobs(applications);
            setApplicationStats(stats);
          } catch (error) {
            console.error('Error processing snapshot:', error);
          } finally {
            setLoading(prev => ({ ...prev, appliedJobs: false, stats: false }));
          }
        },
        (error) => {
          console.error('Error in applications snapshot:', error);
          safeNotification(notificationContext, 'Error loading applications', 'error');
          setLoading(prev => ({ ...prev, appliedJobs: false, stats: false }));
        }
      );

      unsubscribeRef.current = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up applications listener:', error);
      safeNotification(notificationContext, 'Error loading applications', 'error');
      setLoading(prev => ({ ...prev, appliedJobs: false, stats: false }));
      return null;
    }
  }, [userId, notificationContext]);

  // Initial Data Fetch
  useEffect(() => {
    if (!userId) return;

    fetchSavedJobs();
    setupAppliedJobsListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId, fetchSavedJobs, setupAppliedJobsListener]);

  // Handle Job Application
  const handleApplyJob = useCallback((job) => {
    if (!userId) {
      safeNotification(notificationContext, 'Please sign in to apply for jobs', 'warning');
      return;
    }

    if (!activeResume) {
      safeNotification(notificationContext, 'Please upload a resume first', 'warning');
      setShowUploadModal(true);
      return;
    }

    if (!userProfile?.fullName) {
      safeNotification(notificationContext, 'Please complete your profile before applying', 'warning');
      navigate('/student/profile');
      return;
    }

    setSelectedJob(job);
    setCoverLetter('');
    setResumeFile(null);
    setUploadError('');
    setShowApplyModal(true);
  }, [activeResume, userId, userProfile, notificationContext, navigate]);

  const submitApplication = async () => {
    if (!userId || !selectedJob || !activeResume) {
      safeNotification(notificationContext, 'Missing required information', 'error');
      return;
    }

    try {
      setUploading(true);
      let coverLetterUrl = null;
      
      // Upload cover letter file if provided
      if (coverLetter && resumeFile) {
        try {
          const validation = validateFile(resumeFile);
          if (!validation.valid) {
            safeNotification(notificationContext, validation.error, 'error');
            setUploading(false);
            return;
          }

          const formData = new FormData();
          formData.append('file', resumeFile);
          formData.append('upload_preset', 'cover_letters');
          formData.append('folder', `cover_letters/${userId}`);
          
          const result = await uploadFile (formData);
          coverLetterUrl = result.secure_url;
        } catch (error) {
          console.error('Error uploading cover letter:', error);
          safeNotification(notificationContext, 'Cover letter upload failed, continuing with text only', 'warning');
        }
      }

      const applicationData = {
        studentId: userId,
        studentEmail: userEmail,
        jobId: selectedJob.jobId || selectedJob.id,
        jobTitle: selectedJob.jobDetails?.title || selectedJob.title,
        companyId: selectedJob.jobDetails?.companyId || selectedJob.companyId,
        companyName: selectedJob.jobDetails?.company || selectedJob.company,
        resumeUrl: activeResume.documentUrl,
        resumeName: activeResume.documentName,
        coverLetterUrl,
        coverLetterText: coverLetter || '',
        status: 'application_received',
        appliedAt: serverTimestamp(),
        statusUpdatedAt: serverTimestamp(),
        matchScore: calculateMatchScore(selectedJob, userProfile),
        metadata: {
          studentName: userProfile?.fullName || '',
          studentSkills: userProfile?.skills || [],
          educationLevel: userProfile?.educationLevel || '',
          yearsOfExperience: userProfile?.yearsOfExperience || 0
        }
      };

      // Check for duplicate application
      const existingAppQuery = query(
        collection(db, COLLECTIONS.JOB_APPLICATIONS),
        where('studentId', '==', userId),
        where('jobId', '==', applicationData.jobId)
      );
      
      const existingApps = await getDocs(existingAppQuery);
      if (!existingApps.empty) {
        safeNotification(notificationContext, 'You have already applied for this position', 'warning');
        setUploading(false);
        setShowApplyModal(false);
        return;
      }

      await addDoc(collection(db, COLLECTIONS.JOB_APPLICATIONS), applicationData);

      // Remove from saved jobs if applying from saved list
      if (selectedJob.id) {
        try {
          await deleteDoc(doc(db, COLLECTIONS.SAVED_JOBS, selectedJob.id));
          setSavedJobs(prev => prev.filter(job => job.id !== selectedJob.id));
        } catch (error) {
          console.error('Error removing from saved jobs:', error);
        }
      }

      safeNotification(notificationContext, 'Application submitted successfully!', 'success');
      setShowApplyModal(false);
      setCoverLetter('');
      setResumeFile(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      safeNotification(notificationContext, `Failed to submit application: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle Resume Upload
  const handleResumeUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      safeNotification(notificationContext, validation.error, 'error');
      setUploadError(validation.error);
      return;
    }

    setResumeFile(file);
    setUploadError('');
  }, [notificationContext]);

  const uploadResumeToCloudinary = async () => {
    if (!userId || !resumeFile) return;

    try {
      setUploading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('upload_preset', 'resumes');
      formData.append('folder', `resumes/${userId}`);
      formData.append('tags', `resume,${userId},${new Date().getFullYear()}`);

      const cloudinaryResult = await uploadFile (formData);

      // Deactivate previous active resumes
      const previousResumesQuery = query(
        collection(db, COLLECTIONS.USER_DOCUMENTS),
        where('userId', '==', userId),
        where('documentType', '==', 'resume'),
        where('isActive', '==', true)
      );

      const previousSnapshot = await getDocs(previousResumesQuery);
      const updatePromises = previousSnapshot.docs.map(docSnap =>
        updateDoc(doc(db, COLLECTIONS.USER_DOCUMENTS, docSnap.id), { 
          isActive: false,
          deactivatedAt: serverTimestamp()
        })
      );
      await Promise.all(updatePromises);

      const documentData = {
        userId,
        documentName: resumeFile.name,
        documentType: 'resume',
        documentUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        fileSize: resumeFile.size,
        fileType: resumeFile.type,
        isActive: true,
        uploadedAt: serverTimestamp(),
        metadata: {
          pages: cloudinaryResult.pages || 0,
          format: cloudinaryResult.format,
          resourceType: cloudinaryResult.resource_type,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height
        }
      };

      await addDoc(collection(db, COLLECTIONS.USER_DOCUMENTS), documentData);
      setActiveResume({
        ...documentData,
        uploadedAt: new Date()
      });

      safeNotification(notificationContext, 'Resume uploaded successfully!', 'success');
      setShowUploadModal(false);
      setResumeFile(null);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadError(`Upload failed: ${error.message}`);
      safeNotification(notificationContext, 'Failed to upload resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Remove Saved Job
  const handleRemoveSavedJob = useCallback(async (jobId) => {
    if (!window.confirm('Are you sure you want to remove this job from your saved list?')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.SAVED_JOBS, jobId));
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      safeNotification(notificationContext, 'Job removed from saved list', 'success');
    } catch (error) {
      console.error('Error removing saved job:', error);
      safeNotification(notificationContext, 'Failed to remove job', 'error');
    }
  }, [notificationContext]);

  // Get Status Badge Component
  const getStatusBadge = useCallback((status) => {
    const config = STATUS_CONFIG[status] || { variant: 'secondary', label: status };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  }, []);

  // Render Loading States
  const renderLoading = (type) => (
    <div className="text-center py-5">
      <Spinner animation="border" variant={type === 'saved' ? 'primary' : 'info'} />
      <p className="mt-2 text-muted">
        {type === 'saved' ? 'Loading saved jobs...' : 'Loading applications...'}
      </p>
    </div>
  );

  const renderEmptyState = (type) => (
    <Alert variant="info" className="text-center">
      <i className="bi bi-info-circle me-2"></i>
      {type === 'saved' 
        ? "You haven't saved any jobs yet. Start browsing to find opportunities!"
        : "You haven't applied to any jobs yet. Start applying today!"
      }
      <div className="mt-2">
        <Button 
          variant="outline-info" 
          size="sm"
          onClick={() => navigate('/student/search/jobs')}
        >
          <i className="bi bi-search me-1"></i>
          Browse Jobs
        </Button>
      </div>
    </Alert>
  );

  // Render Job Card
  const renderJobCard = (job, index) => {
    const matchScore = job.matchScore || calculateMatchScore(job, userProfile);
    const deadline = job.jobDetails?.deadline || job.deadline;
    const isDeadlinePassed = deadline && new Date(deadline) < new Date();
    
    return (
      <Card key={job.id || index} className="mb-3 border hover-shadow">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <h5 className="mb-1">{job.jobDetails?.title || job.title}</h5>
              <p className="text-muted mb-2">
                <i className="bi bi-building me-1"></i>
                {job.jobDetails?.company || job.company}
                {job.jobDetails?.location && ` • ${job.jobDetails.location}`}
              </p>
              
              <div className="d-flex align-items-center mb-2">
                <ProgressBar
                  now={matchScore}
                  variant="success"
                  className="flex-grow-1 me-2"
                  style={{ height: '8px' }}
                />
                <Badge bg="success" className="fw-normal">
                  {matchScore}% Match
                </Badge>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    <i className="bi bi-calendar-check me-1"></i>
                    Saved: {formatDate(job.savedDate)}
                  </small>
                  {deadline && (
                    <small className={`ms-3 ${isDeadlinePassed ? 'text-danger' : 'text-muted'}`}>
                      <i className="bi bi-clock me-1"></i>
                      Apply by: {formatDate(deadline)}
                      {isDeadlinePassed && ' (Expired)'}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              {job.jobDetails?.salary && (
                <Badge bg="light" text="dark" className="me-2">
                  <i className="bi bi-cash me-1"></i>
                  {job.jobDetails.salary}
                </Badge>
              )}
              {job.jobDetails?.jobType && (
                <Badge bg="light" text="dark">
                  <i className="bi bi-briefcase me-1"></i>
                  {job.jobDetails.jobType}
                </Badge>
              )}
            </div>
            <div>
              <Button
                variant="primary"
                size="sm"
                className="me-2"
                onClick={() => handleApplyJob(job)}
                disabled={!userProfile || isDeadlinePassed}
                title={isDeadlinePassed ? 'Application deadline has passed' : 'Apply now'}
              >
                {isDeadlinePassed ? 'Expired' : 'Apply Now'}
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemoveSavedJob(job.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Render Application Row
  const renderApplicationRow = (application, index) => (
    <tr key={application.id || index}>
      <td>
        <div className="fw-medium">{application.jobTitle}</div>
        {application.matchScore && (
          <small className="text-muted">
            {application.matchScore}% match
          </small>
        )}
      </td>
      <td>{application.companyName}</td>
      <td>
        <small>{formatDate(application.appliedDate)}</small>
        {application.statusUpdated && (
          <div>
            <small className="text-muted">
              Updated: {formatDate(application.statusUpdated)}
            </small>
          </div>
        )}
      </td>
      <td>{getStatusBadge(application.status)}</td>
      <td>
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-info"
            size="sm"
            id={`dropdown-${application.id}`}
          >
            Actions
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => navigate(`/student/application/${application.id}`)}
            >
              <i className="bi bi-eye me-2"></i>
              View Details
            </Dropdown.Item>
            <Dropdown.Item
              href={`mailto:${application.companyEmail || 'info@company.com'}?subject=Follow-up: ${application.jobTitle}&body=Dear Hiring Manager,%0D%0A%0D%0AI recently applied for the ${application.jobTitle} position and wanted to follow up on my application status.%0D%0A%0D%0ARegards,%0D%0A${userProfile?.fullName || ''}`}
            >
              <i className="bi bi-envelope me-2"></i>
              Send Follow-up
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              className="text-danger"
              onClick={async () => {
                if (window.confirm('Are you sure you want to withdraw this application?')) {
                  try {
                    await updateDoc(doc(db, COLLECTIONS.JOB_APPLICATIONS, application.id), {
                      status: 'withdrawn',
                      statusUpdatedAt: serverTimestamp(),
                      withdrawnAt: serverTimestamp()
                    });
                    safeNotification(notificationContext, 'Application withdrawn successfully', 'success');
                  } catch (error) {
                    console.error('Error withdrawing application:', error);
                    safeNotification(notificationContext, 'Failed to withdraw application', 'error');
                  }
                }
              }}
            >
              <i className="bi bi-x-circle me-2"></i>
              Withdraw Application
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </td>
    </tr>
  );

  if (!userId) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please sign in to view your jobs dashboard
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">My Jobs</h2>
          <p className="text-muted mb-0">
            Manage your saved jobs, applications, and career progress
            {userProfile && ` • Welcome back, ${userProfile.fullName?.split(' ')[0] || 'Student'}!`}
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="lg"
            className="me-2"
            onClick={() => setShowUploadModal(true)}
            disabled={loading.profile}
          >
            <i className="bi bi-file-earmark-arrow-up me-2"></i>
            {activeResume ? 'Update Resume' : 'Upload Resume'}
          </Button>
          <Button
            variant="outline-success"
            size="lg"
            onClick={() => navigate('/student/search/jobs')}
          >
            <i className="bi bi-search me-2"></i>
            Find Jobs
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-primary">
            <Card.Body className="text-center">
              <h3 className="text-primary mb-1">
                {loading.savedJobs ? <Spinner animation="border" size="sm" /> : savedJobs.length}
              </h3>
              <small className="text-muted">Saved Jobs</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-info">
            <Card.Body className="text-center">
              <h3 className="text-info mb-1">
                {loading.stats ? <Spinner animation="border" size="sm" /> : applicationStats.total}
              </h3>
              <small className="text-muted">Total Applications</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-warning">
            <Card.Body className="text-center">
              <h3 className="text-warning mb-1">
                {loading.stats ? <Spinner animation="border" size="sm" /> : applicationStats.active}
              </h3>
              <small className="text-muted">Active Applications</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-success">
            <Card.Body className="text-center">
              <h3 className="text-success mb-1">
                {loading.stats ? <Spinner animation="border" size="sm" /> : applicationStats.accepted}
              </h3>
              <small className="text-muted">Accepted Offers</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="mb-4">
        {/* Saved Jobs Column */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <span className="d-flex align-items-center">
                  <i className="bi bi-bookmark-heart text-primary me-2"></i>
                  Saved Jobs
                </span>
                <Badge bg="primary" pill>
                  {loading.savedJobs ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    savedJobs.length
                  )} jobs
                </Badge>
              </Card.Title>

              {loading.savedJobs 
                ? renderLoading('saved')
                : savedJobs.length === 0 
                  ? renderEmptyState('saved')
                  : savedJobs.map(renderJobCard)
              }

              <Button
                variant="outline-primary"
                className="w-100 mt-3"
                onClick={() => navigate('/student/search/jobs')}
              >
                <i className="bi bi-search me-2"></i>
                Browse More Jobs
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Applied Jobs Column */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <span className="d-flex align-items-center">
                  <i className="bi bi-file-text text-info me-2"></i>
                  Applications
                </span>
                <Badge bg="info" pill>
                  {loading.appliedJobs ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    applicationStats.total
                  )} applications
                </Badge>
              </Card.Title>

              {loading.appliedJobs 
                ? renderLoading('applied')
                : appliedJobs.length === 0 
                  ? renderEmptyState('applied')
                  : (
                    <>
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead>
                            <tr>
                              <th>Position</th>
                              <th>Company</th>
                              <th>Applied</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appliedJobs.slice(0, MAX_APPLICATIONS_DISPLAY).map(renderApplicationRow)}
                          </tbody>
                        </Table>
                      </div>

                      {appliedJobs.length > MAX_APPLICATIONS_DISPLAY && (
                        <div className="text-center mt-3">
                          <Button
                            variant="link"
                            onClick={() => navigate('/student/applications')}
                          >
                            View all {appliedJobs.length} applications
                            <i className="bi bi-chevron-right ms-1"></i>
                          </Button>
                        </div>
                      )}

                      {/* Application Statistics */}
                      <div className="mt-4">
                        <h6 className="mb-3">
                          <i className="bi bi-graph-up me-2"></i>
                          Application Statistics
                        </h6>
                        <Row className="text-center">
                          <Col xs={3}>
                            <div className="p-2">
                              <h4 className="text-success mb-1">{applicationStats.active}</h4>
                              <small className="text-muted">Active</small>
                            </div>
                          </Col>
                          <Col xs={3}>
                            <div className="p-2">
                              <h4 className="text-warning mb-1">{applicationStats.pending}</h4>
                              <small className="text-muted">Pending</small>
                            </div>
                          </Col>
                          <Col xs={3}>
                            <div className="p-2">
                              <h4 className="text-danger mb-1">{applicationStats.rejected}</h4>
                              <small className="text-muted">Rejected</small>
                            </div>
                          </Col>
                          <Col xs={3}>
                            <div className="p-2">
                              <h4 className="text-info mb-1">{applicationStats.accepted}</h4>
                              <small className="text-muted">Accepted</small>
                            </div>
                          </Col>
                        </Row>
                        
                        {/* Progress Visualization */}
                        <div className="mt-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small>Application Progress</small>
                            <small>
                              {applicationStats.total > 0
                                ? `${Math.round((applicationStats.accepted / applicationStats.total) * 100)}% success rate`
                                : 'No applications yet'
                              }
                            </small>
                          </div>
                          <ProgressBar>
                            <ProgressBar
                              variant="success"
                              now={(applicationStats.accepted / Math.max(applicationStats.total, 1)) * 100}
                              key={1}
                            />
                            <ProgressBar
                              variant="warning"
                              now={(applicationStats.pending / Math.max(applicationStats.total, 1)) * 100}
                              key={2}
                            />
                            <ProgressBar
                              variant="danger"
                              now={(applicationStats.rejected / Math.max(applicationStats.total, 1)) * 100}
                              key={3}
                            />
                          </ProgressBar>
                        </div>
                      </div>
                    </>
                  )
              }
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Apply Job Modal */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-send-check text-primary me-2"></i>
            Apply for {selectedJob?.jobDetails?.title || selectedJob?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <>
              <Alert variant="info" className="mb-4">
                <div className="d-flex">
                  <i className="bi bi-info-circle me-2"></i>
                  <div>
                    <strong>Application Summary</strong>
                    <p className="mb-0 mt-1">
                      You're applying to <strong>{selectedJob.jobDetails?.company || selectedJob.company}</strong> as{' '}
                      <strong>{selectedJob.jobDetails?.title || selectedJob.title}</strong>
                    </p>
                    {selectedJob.deadline && (
                      <small className="text-muted d-block mt-1">
                        Deadline: {formatDate(selectedJob.deadline)}
                      </small>
                    )}
                  </div>
                </div>
              </Alert>

              <div className="mb-4">
                <h6>Your Resume</h6>
                <Card className="border-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                        <span className="fw-medium">
                          {activeResume?.documentName || 'No resume uploaded'}
                        </span>
                        {activeResume && (
                          <small className="text-muted ms-2">
                            (Uploaded {formatDate(activeResume.uploadedAt)})
                          </small>
                        )}
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setShowApplyModal(false);
                          setShowUploadModal(true);
                        }}
                      >
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Change Resume
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              <Form.Group className="mb-4">
                <Form.Label>
                  <strong>Cover Letter (Optional)</strong>
                  <small className="text-muted ms-1"> - Personalized applications perform better</small>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Write a personalized cover letter explaining why you're a good fit for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  maxLength={2000}
                />
                <Form.Text className="text-muted">
                  {coverLetter.length}/2000 characters
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  <strong>Additional Documents</strong>
                </Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={uploading}
                />
                <Form.Text className="text-muted">
                  Upload certificates, portfolio, or other supporting documents (PDF, DOC, DOCX, max 5MB each)
                </Form.Text>
              </Form.Group>

              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Before submitting:</strong>
                <ul className="mb-0 mt-1">
                  <li>Review your resume for accuracy</li>
                  <li>Check for spelling errors in your cover letter</li>
                  <li>Ensure your contact information is up-to-date</li>
                  <li>Your match score for this position: 
                    <Badge bg="success" className="ms-2">
                      {calculateMatchScore(selectedJob, userProfile)}%
                    </Badge>
                  </li>
                </ul>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApplyModal(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submitApplication}
            disabled={uploading || !activeResume}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-send-check me-2"></i>
                Submit Application
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Resume Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-cloud-arrow-up text-primary me-2"></i>
            {activeResume ? 'Update Resume' : 'Upload Resume'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-4">
            <i className="bi bi-info-circle me-2"></i>
            Your resume is stored securely in Cloudinary and accessible to employers when you apply.
          </Alert>

          <Form.Group className="mb-4">
            <Form.Label>
              <strong>Select Resume File</strong>
            </Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              disabled={uploading}
            />
            <Form.Text className="text-muted">
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </Form.Text>
          </Form.Group>

          {uploadError && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {uploadError}
            </Alert>
          )}

          {resumeFile && (
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-file-earmark-text fs-4 text-primary me-3"></i>
                    <div>
                      <strong>{resumeFile.name}</strong>
                      <div className="text-muted small">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <Badge bg="info">
                    {resumeFile.type.split('/')[1].toUpperCase()}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          )}

          {activeResume && (
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Uploading a new resume will replace your current active resume:
              <div className="mt-2">
                <i className="bi bi-file-earmark me-1"></i>
                <strong>{activeResume.documentName}</strong>
                <small className="text-muted ms-2">
                  (Uploaded {formatDate(activeResume.uploadedAt)})
                </small>
              </div>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={uploadResumeToCloudinary}
            disabled={!resumeFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              <>
                <i className="bi bi-cloud-arrow-up me-2"></i>
                Upload to Cloudinary
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Jobs;