/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Card,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
  ProgressBar,
} from 'react-bootstrap';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { useAuth } from '../../context/AuthContext';
import { getStudentApplications, getApplicationStats } from '../../services/applicationService';
import { getStudentDocuments } from '../../services/studentServices';
import { uploadToCloudinary, getCloudinaryUrl } from '../../services/cloudinaryService';
import { db } from '../../config/firebase';
import { storage } from '../../config/firebase';
import './ActivityFeed.css';

const ActivityFeed = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    applications: 0,
    courses: 0,
    documents: 0,
    interviews: 0,
    pendingApplications: 0,
    successRate: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('resume');
  const [realtimeActivities, setRealtimeActivities] = useState([]);

  // Activity types configuration
  const ACTIVITY_TYPES = {
    application: {
      icon: 'bi-briefcase',
      color: 'primary',
      label: 'Application',
      firebaseCollection: 'applications',
    },
    course: {
      icon: 'bi-book',
      color: 'success',
      label: 'Course',
      firebaseCollection: 'student_courses',
    },
    document: {
      icon: 'bi-file-earmark',
      color: 'info',
      label: 'Document',
      firebaseCollection: 'student_documents',
    },
    recommendation: {
      icon: 'bi-star',
      color: 'warning',
      label: 'Recommendation',
      firebaseCollection: 'recommendations',
    },
    deadline: {
      icon: 'bi-calendar-check',
      color: 'danger',
      label: 'Deadline',
      firebaseCollection: 'deadlines',
    },
    interview: {
      icon: 'bi-camera-video',
      color: 'purple',
      label: 'Interview',
      firebaseCollection: 'interviews',
    },
    notification: {
      icon: 'bi-bell',
      color: 'secondary',
      label: 'Notification',
      firebaseCollection: 'notifications',
    },
  };

  // Format timestamp to time ago
  const formatTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return 'Recently';

    let date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
    });
  }, []);

  // Fetch all activity data
  const fetchActivities = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch applications
      const applicationsResult = await getStudentApplications(currentUser.uid, {
        limitCount: 5,
      });

      // Fetch documents
      const documentsResult = await getStudentDocuments(currentUser.uid);

      // Fetch application stats
      const statsResult = await getApplicationStats(currentUser.uid);

      // Transform data into activities
      const allActivities = [];

      // Add applications as activities
      if (applicationsResult.success && applicationsResult.data) {
        applicationsResult.data.forEach((app) => {
          allActivities.push({
            id: `app_${app.id}`,
            type: 'application',
            title: `Applied for ${app.job?.title || 'Job'}`,
            details: app.company?.name || app.job?.companyName || 'Unknown Company',
            time: app.appliedDate,
            icon: ACTIVITY_TYPES.application.icon,
            color: ACTIVITY_TYPES.application.color,
            metadata: app,
            timestamp: app.appliedDate,
          });
        });
      }

      // Add documents as activities
      if (documentsResult.success && documentsResult.data) {
        documentsResult.data.slice(0, 3).forEach((doc) => {
          allActivities.push({
            id: `doc_${doc.id}`,
            type: 'document',
            title: `Uploaded ${doc.type || 'Document'}`,
            details: doc.name || doc.filename || 'Document',
            time: doc.uploadDate || doc.createdAt,
            icon: ACTIVITY_TYPES.document.icon,
            color: ACTIVITY_TYPES.document.color,
            metadata: doc,
            timestamp: doc.uploadDate || doc.createdAt,
          });
        });
      }

      // Add sample activities if none found
      if (allActivities.length === 0) {
        allActivities.push(...getSampleActivities());
      }

      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => {
        const timeA = a.timestamp || a.time;
        const timeB = b.timestamp || b.time;
        return new Date(timeB) - new Date(timeA);
      });

      setActivities(allActivities.slice(0, 10));

      // Update stats
      if (statsResult.success && statsResult.data) {
        setStats((prev) => ({
          ...prev,
          applications: statsResult.data.total || 0,
          pendingApplications: statsResult.data.pending || 0,
          successRate: parseFloat(statsResult.data.successRate) || 0,
        }));
      }

      // Update document count
      if (documentsResult.success && documentsResult.data) {
        setStats((prev) => ({
          ...prev,
          documents: documentsResult.data.length || 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities. Using sample data.');
      setActivities(getSampleActivities());
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Get sample activities (fallback)
  const getSampleActivities = () => {
    return [
      {
        id: 1,
        type: 'application',
        title: 'Applied for Software Developer Position',
        details: 'Tech Solutions Lesotho',
        time: '2 hours ago',
        icon: 'bi-briefcase',
        color: 'primary',
      },
      {
        id: 2,
        type: 'course',
        title: 'Completed React Fundamentals Course',
        details: 'Scored 95% on final assessment',
        time: '1 day ago',
        icon: 'bi-book',
        color: 'success',
      },
      {
        id: 3,
        type: 'document',
        title: 'Uploaded Updated Resume',
        details: 'Added new project experience',
        time: '2 days ago',
        icon: 'bi-file-earmark',
        color: 'info',
      },
      {
        id: 4,
        type: 'recommendation',
        title: 'Received Course Recommendation',
        details: 'Advanced JavaScript based on your profile',
        time: '3 days ago',
        icon: 'bi-star',
        color: 'warning',
      },
      {
        id: 5,
        type: 'deadline',
        title: 'Application Deadline Approaching',
        details: 'Data Analyst at Basotho Bank - Due in 3 days',
        time: '4 days ago',
        icon: 'bi-calendar-check',
        color: 'danger',
      },
    ];
  };

  // Setup realtime listener for new activities
  useEffect(() => {
    if (!currentUser?.uid) return;

    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newActivities = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: doc.data().activityType || 'notification',
          icon: ACTIVITY_TYPES[doc.data().activityType]?.icon || 'bi-bell',
          color: ACTIVITY_TYPES[doc.data().activityType]?.color || 'secondary',
        }));
        setRealtimeActivities(newActivities);
      },
      (error) => {
        console.error('Realtime listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser?.uid) return;

    setSelectedFile(file);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Option 1: Upload to Cloudinary (for images/documents)
      if (fileType === 'image' || fileType === 'document') {
        const uploadResult = await uploadToCloudinary(file, `students/${currentUser.uid}`);

        if (uploadResult.success) {
          // Save document reference to Firestore
          await saveDocumentToFirestore(uploadResult.data, file);

          // Add activity
          addActivity('document', `Uploaded ${file.name}`, 'Document uploaded successfully');

          setUploadProgress(100);
          setTimeout(() => {
            setUploading(false);
            setSelectedFile(null);
            fetchActivities(); // Refresh activities
          }, 1000);
        } else {
          throw new Error(uploadResult.error || 'Upload failed');
        }
      }
      // Option 2: Upload to Firebase Storage (for any file)
      else {
        const storageRef = ref(storage, `students/${currentUser.uid}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            setError('Upload failed: ' + error.message);
            setUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save to Firestore
            await saveDocumentToFirestore(
              {
                url: downloadURL,
                name: file.name,
                size: file.size,
                type: file.type,
              },
              file
            );

            // Add activity
            addActivity(
              'document',
              `Uploaded ${file.name}`,
              'Document uploaded to Firebase Storage'
            );

            setUploading(false);
            setSelectedFile(null);
            fetchActivities(); // Refresh activities
          }
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + error.message);
      setUploading(false);
    }
  };

  // Save document reference to Firestore
  const saveDocumentToFirestore = async (fileData, originalFile) => {
    try {
      const docRef = collection(db, 'student_documents');
      await addDoc(docRef, {
        userId: currentUser.uid,
        name: originalFile.name,
        type: fileType,
        url: fileData.secure_url || fileData.url,
        publicId: fileData.public_id,
        size: originalFile.size,
        mimeType: originalFile.type,
        uploadDate: Timestamp.now(),
        lastAccessed: Timestamp.now(),
        metadata: fileData,
      });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  // Add new activity to Firestore
  const addActivity = async (activityType, title, details) => {
    try {
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        userId: currentUser.uid,
        activityType,
        title,
        details,
        createdAt: Timestamp.now(),
        read: false,
      });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  // Mark activity as read
  const markAsRead = async (activityId) => {
    try {
      const activityRef = doc(db, 'activities', activityId);
      await updateDoc(activityRef, {
        read: true,
        readAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Load more activities
  const loadMoreActivities = async () => {
    try {
      const moreResult = await getStudentApplications(currentUser.uid, {
        limitCount: 5,
        lastDoc: activities[activities.length - 1]?.metadata?.lastDoc,
      });

      if (moreResult.success && moreResult.data.length > 0) {
        const newActivities = moreResult.data.map((app) => ({
          id: `app_${app.id}`,
          type: 'application',
          title: `Applied for ${app.job?.title || 'Job'}`,
          details: app.company?.name || app.job?.companyName || 'Unknown Company',
          time: app.appliedDate,
          icon: ACTIVITY_TYPES.application.icon,
          color: ACTIVITY_TYPES.application.color,
          metadata: app,
        }));

        setActivities((prev) => [...prev, ...newActivities]);
      }
    } catch (error) {
      console.error('Error loading more activities:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Combine realtime and fetched activities
  const allActivities = [...realtimeActivities, ...activities]
    .sort((a, b) => {
      const timeA = a.createdAt || a.timestamp || a.time;
      const timeB = b.createdAt || b.timestamp || b.time;
      return new Date(timeB) - new Date(timeA);
    })
    .slice(0, 10);

  if (loading && activities.length === 0) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading activities...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Activity Feed</h2>

      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Upload Section */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Upload Documents</h5>
          <div className="d-flex align-items-center gap-3">
            <select
              className="form-select w-auto"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <option value="resume">Resume/CV</option>
              <option value="transcript">Transcript</option>
              <option value="certificate">Certificate</option>
              <option value="portfolio">Portfolio</option>
              <option value="other">Other</option>
            </select>

            <label className="btn btn-primary mb-0">
              <i className="bi bi-cloud-upload me-2"></i>
              Choose File
              <input
                type="file"
                className="d-none"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>

            {uploading && (
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between mb-1">
                  <small>Uploading {selectedFile?.name}</small>
                  <small>{Math.round(uploadProgress)}%</small>
                </div>
                <ProgressBar now={uploadProgress} animated />
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Activity Feed */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Recent Activities</h5>
            <Badge bg="light" text="dark" pill>
              {allActivities.length} activities
            </Badge>
          </div>

          {allActivities.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              No activities yet. Start by applying for jobs or uploading documents!
            </Alert>
          ) : (
            <>
              <ListGroup variant="flush">
                {allActivities.map((activity) => (
                  <ListGroup.Item
                    key={activity.id}
                    className="py-3 hover-effect"
                    onClick={() => activity.id?.startsWith('act_') && markAsRead(activity.id)}
                    style={{ cursor: activity.id?.startsWith('act_') ? 'pointer' : 'default' }}
                  >
                    <div className="d-flex align-items-start">
                      <div className={`bg-${activity.color}-subtle p-2 rounded me-3`}>
                        <i
                          className={`bi ${activity.icon} text-${activity.color}`}
                          style={{ fontSize: '1.2rem' }}
                        ></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">
                          {activity.title}
                          {activity.id?.startsWith('act_') && !activity.read && (
                            <Badge bg="danger" className="ms-2" pill>
                              New
                            </Badge>
                          )}
                        </h6>
                        <p className="text-muted mb-1 small">{activity.details}</p>
                        <small className="text-muted">
                          {formatTimeAgo(activity.time || activity.createdAt || activity.timestamp)}
                        </small>
                      </div>
                      <Badge bg={activity.color} className="ms-2">
                        {ACTIVITY_TYPES[activity.type]?.label || activity.type}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="text-center mt-4">
                <Button variant="outline-primary" onClick={loadMoreActivities} disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" />
                      <span className="ms-2">Loading...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Load More Activities
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Stats Card */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <h5 className="mb-3">Quick Stats</h5>
          <Row className="text-center">
            <Col md={3} className="mb-3 mb-md-0">
              <div className="p-3 border rounded">
                <h3 className="text-primary">{stats.applications}</h3>
                <p className="text-muted mb-0">Total Applications</p>
                {stats.pendingApplications > 0 && (
                  <small className="text-warning">{stats.pendingApplications} pending</small>
                )}
              </div>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="p-3 border rounded">
                <h3 className="text-success">{stats.courses}</h3>
                <p className="text-muted mb-0">Courses Completed</p>
              </div>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="p-3 border rounded">
                <h3 className="text-warning">{stats.documents}</h3>
                <p className="text-muted mb-0">Documents Uploaded</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 border rounded">
                <h3 className="text-info">{stats.successRate}%</h3>
                <p className="text-muted mb-0">Success Rate</p>
                <ProgressBar
                  now={stats.successRate}
                  variant="info"
                  className="mt-2"
                  style={{ height: '6px' }}
                />
              </div>
            </Col>
          </Row>

          {/* Additional Stats */}
          <Row className="mt-4 text-center">
            <Col md={4} className="mb-3">
              <div className="p-3 border rounded bg-light">
                <h5 className="text-purple">{stats.interviews}</h5>
                <p className="text-muted mb-0">Interviews Scheduled</p>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="p-3 border rounded bg-light">
                <h5 className="text-danger">{realtimeActivities.filter((a) => !a.read).length}</h5>
                <p className="text-muted mb-0">Unread Activities</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 border rounded bg-light">
                <h5 className="text-success">
                  {allActivities.filter((a) => a.type === 'application').length}
                </h5>
                <p className="text-muted mb-0">Recent Applications</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Cloudinary Integration Info */}
      <Card className="shadow-sm mt-4 bg-info bg-opacity-10 border-info">
        <Card.Body>
          <h5 className="text-info">
            <i className="bi bi-cloud me-2"></i>
            Cloudinary Integration
          </h5>
          <p className="mb-0">
            Your documents are securely stored in Cloudinary with automatic optimization. Images are
            compressed, PDFs are stored as raw files, and all uploads are encrypted in transit.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ActivityFeed;
