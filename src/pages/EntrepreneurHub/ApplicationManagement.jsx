/* eslint-disable react-hooks/exhaustive-deps */
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';

import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const ApplicationManagement = () => {
  const { currentUser, userProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [feedback, setFeedback] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (currentUser && userProfile?.organizationId) {
      loadApplications();
    }
  }, [currentUser, userProfile]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');

      if (!userProfile?.organizationId) {
        throw new Error('Organization ID not found');
      }

      // Query applications for this organization
      const applicationsRef = collection(db, 'fundingApplications');
      const q = query(
        applicationsRef,
        where('organizationId', '==', userProfile.organizationId),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const applicationsData = [];

      querySnapshot.forEach((doc) => {
        applicationsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications. Please try again.');

      // Load mock data if Firebase fails
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockApplications = [
      {
        id: 'APP-001',
        startupName: 'TechFarm Solutions',
        entrepreneurName: 'John Doe',
        programName: 'Seed Funding Program',
        fundingAmount: 50000,
        status: 'under_review',
        submittedAt: new Date('2024-01-15'),
        businessDescription: 'Mobile platform connecting farmers with markets',
      },
      {
        id: 'APP-002',
        startupName: 'EduLearn Lesotho',
        entrepreneurName: 'Mary Smith',
        programName: 'Growth Accelerator',
        fundingAmount: 75000,
        status: 'approved',
        submittedAt: new Date('2024-01-10'),
        businessDescription: 'Online learning platform for vocational skills',
      },
      {
        id: 'APP-003',
        startupName: 'GreenEnergy Basotho',
        entrepreneurName: 'David Khoaba',
        programName: 'Seed Funding Program',
        fundingAmount: 100000,
        status: 'pending',
        submittedAt: new Date('2024-01-20'),
        businessDescription: 'Solar energy solutions for rural communities',
      },
    ];
    setApplications(mockApplications);
  };

  const handleStatusUpdate = async (application) => {
    setSelectedApplication(application);
    setStatusUpdate(application.status);
    setFeedback('');
    setShowModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedApplication || !statusUpdate) return;

    try {
      setUpdating(true);
      setError('');

      // Update in Firebase
      const applicationRef = doc(db, 'fundingApplications', selectedApplication.id);

      const updateData = {
        status: statusUpdate,
        updatedAt: new Date(),
        reviewedBy: currentUser.email,
        organizationId: userProfile.organizationId,
      };

      if (feedback) {
        updateData.feedback = feedback;
        updateData.lastFeedbackDate = new Date();
      }

      await updateDoc(applicationRef, updateData);

      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app.id === selectedApplication.id ? { ...app, ...updateData } : app))
      );

      setShowModal(false);
      setSelectedApplication(null);
      setStatusUpdate('');
      setFeedback('');
    } catch (error) {
      console.error('Error updating application:', error);
      setError('Failed to update application status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'secondary',
      under_review: 'warning',
      approved: 'success',
      rejected: 'danger',
      funded: 'info',
      completed: 'primary',
    };
    return variants[status] || 'secondary';
  };

  const getStatusDisplay = (status) => {
    const display = {
      pending: 'Pending',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      funded: 'Funded',
      completed: 'Completed',
    };
    return display[status] || status;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    } else if (date instanceof Date) {
      return date.toLocaleDateString();
    } else if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }

    return 'Invalid Date';
  };

  const getTotalApplications = () => applications.length;
  const getPendingApplications = () =>
    applications.filter((app) => app.status === 'pending').length;
  const getUnderReviewApplications = () =>
    applications.filter((app) => app.status === 'under_review').length;
  const getApprovedApplications = () =>
    applications.filter((app) => app.status === 'approved').length;

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading applications...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Application Management</h1>
          <p className="text-muted">Track and manage all funding applications</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Application Statistics */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-primary mb-2">📋</div>
              <h3>{getTotalApplications()}</h3>
              <p className="text-muted mb-0">Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-warning mb-2">⏳</div>
              <h3>{getPendingApplications()}</h3>
              <p className="text-muted mb-0">Pending Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-info mb-2">🔍</div>
              <h3>{getUnderReviewApplications()}</h3>
              <p className="text-muted mb-0">Under Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="display-6 text-success mb-2">✅</div>
              <h3>{getApprovedApplications()}</h3>
              <p className="text-muted mb-0">Approved</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Application Pipeline</h5>
          <Button variant="outline-primary" size="sm" onClick={loadApplications} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Card.Header>
        <Card.Body>
          {applications.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Startup</th>
                  <th>Entrepreneur</th>
                  <th>Program</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.id}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{application.startupName}</strong>
                        {application.businessDescription && (
                          <small className="d-block text-muted">
                            {application.businessDescription.substring(0, 50)}...
                          </small>
                        )}
                      </div>
                    </td>
                    <td>{application.entrepreneurName}</td>
                    <td>{application.programName}</td>
                    <td>M{application.fundingAmount?.toLocaleString()}</td>
                    <td>
                      <Badge bg={getStatusVariant(application.status)}>
                        {getStatusDisplay(application.status)}
                      </Badge>
                    </td>
                    <td>{formatDate(application.submittedAt)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleStatusUpdate(application)}
                      >
                        Update Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <div className="display-1 text-muted mb-3">📋</div>
              <h4>No Applications Found</h4>
              <p className="text-muted">
                There are no funding applications to manage at the moment.
              </p>
              <Button variant="primary" onClick={loadApplications}>
                Refresh Applications
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Application Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div>
              <div className="mb-3">
                <strong>Startup:</strong> {selectedApplication.startupName}
              </div>
              <div className="mb-3">
                <strong>Entrepreneur:</strong> {selectedApplication.entrepreneurName}
              </div>
              <div className="mb-3">
                <strong>Funding Amount:</strong> M
                {selectedApplication.fundingAmount?.toLocaleString()}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="funded">Funded</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Feedback (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback for the entrepreneur..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={updating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submitStatusUpdate}
            disabled={updating || !statusUpdate}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ApplicationManagement;
