/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
  FormControl,
  Pagination,
  Dropdown,
} from 'react-bootstrap';
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaUser,
  FaBuilding,
  FaUniversity,
  FaBusinessTime,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaSync,
  FaFilter,
  FaDownload,
  FaTrash,
  FaClipboardCheck,
  FaUsers,
  FaArrowLeft,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import adminService from '../../services/adminService';

const PendingApprovals = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();
  const navigate = useNavigate();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    companies: 0,
    institutes: 0,
    entrepreneurs: 0,
    youth: 0,
    students: 0,
    employers: 0,
  });
  const itemsPerPage = 20;

  useEffect(() => {
    if (currentUser && userProfile && isAdmin) {
      loadPendingUsers();
      loadStats();
    }
  }, [currentUser, userProfile, isAdmin, currentPage, filterType, searchTerm]);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);

      // Use admin service to get pending users
      const result = await adminService.users.getPendingApprovals(currentUser, userProfile);

      if (result.success) {
        let users = result.data.users || [];

        // Apply filters
        if (filterType !== 'all') {
          users = users.filter((user) => user.userType === filterType);
        }

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          users = users.filter(
            (user) =>
              user.email?.toLowerCase().includes(term) ||
              user.displayName?.toLowerCase().includes(term) ||
              user.userType?.toLowerCase().includes(term) ||
              user.phoneNumber?.toLowerCase().includes(term)
          );
        }

        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);

        setTotalPages(Math.ceil(users.length / itemsPerPage));
        setPendingUsers(paginatedUsers);
      } else {
        throw new Error(result.error || 'Failed to load pending users');
      }
    } catch (error) {
      console.error('Error loading pending users:', error);
      addErrorNotification('Error', 'Failed to load pending users');
      setPendingUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await adminService.users.getPendingApprovals(currentUser, userProfile);

      if (result.success) {
        const users = result.data.users || [];

        const statsData = {
          total: users.length,
          companies: users.filter((u) => u.userType === 'company').length,
          institutes: users.filter((u) => u.userType === 'institute').length,
          entrepreneurs: users.filter((u) => u.userType === 'entrepreneur').length,
          youth: users.filter((u) => u.userType === 'youth').length,
          students: users.filter((u) => u.userType === 'student').length,
          employers: users.filter((u) => u.userType === 'employer').length,
        };

        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      addErrorNotification('Error', 'Failed to load statistics');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingUsers();
    loadStats();
  };

  const handleViewDetails = async (user) => {
    try {
      setSelectedUser(user);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      addErrorNotification('Error', 'Failed to load user details');
    }
  };

  const handleApprove = async (userId, isBulk = false, comments = '') => {
    try {
      const result = await adminService.users.approveUser(
        userId,
        comments || approveComments,
        currentUser,
        userProfile
      );

      if (result.success) {
        addSuccessNotification('Success', 'User approved successfully');

        if (!isBulk) {
          setShowApproveModal(false);
          setApproveComments('');
        }

        // Remove from selected users if in bulk mode
        if (isBulk) {
          setSelectedUsers((prev) => prev.filter((id) => id !== userId));
        }

        // Refresh data
        loadPendingUsers();
        loadStats();
      } else {
        throw new Error(result.error || 'Approval failed');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      addErrorNotification('Error', error.message || 'Failed to approve user');
    }
  };

  const handleReject = async (userId, isBulk = false, reason = '') => {
    try {
      const result = await adminService.rejectUser(
        userId,
        reason || rejectReason,
        currentUser,
        userProfile
      );

      if (result.success) {
        addSuccessNotification('Success', 'User rejected successfully');

        if (!isBulk) {
          setShowRejectModal(false);
          setRejectReason('');
        }

        // Remove from selected users if in bulk mode
        if (isBulk) {
          setSelectedUsers((prev) => prev.filter((id) => id !== userId));
        }

        // Refresh data
        loadPendingUsers();
        loadStats();
      } else {
        throw new Error(result.error || 'Rejection failed');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      addErrorNotification('Error', error.message || 'Failed to reject user');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      addErrorNotification('Error', 'Please select users to approve');
      return;
    }

    try {
      const result = await adminService.users.bulkApproveUsers(
        selectedUsers,
        'Bulk approval',
        currentUser,
        userProfile
      );

      if (result.success) {
        addSuccessNotification('Success', `${selectedUsers.length} users approved successfully`);
        setSelectedUsers([]);
        loadPendingUsers();
        loadStats();
      } else {
        throw new Error(result.error || 'Bulk approval failed');
      }
    } catch (error) {
      console.error('Error bulk approving users:', error);
      addErrorNotification('Error', error.message || 'Failed to approve users');
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.length === 0) {
      addErrorNotification('Error', 'Please select users to reject');
      return;
    }

    const reason = prompt('Enter rejection reason for all selected users:');
    if (!reason) return;

    try {
      const result = await adminService.bulkRejectUsers(
        selectedUsers,
        reason,
        currentUser,
        userProfile
      );

      if (result.success) {
        addSuccessNotification('Success', result.message);
        setSelectedUsers([]);
        loadPendingUsers();
        loadStats();
      } else {
        throw new Error(result.error || 'Bulk rejection failed');
      }
    } catch (error) {
      console.error('Error bulk rejecting users:', error);
      addErrorNotification('Error', error.message || 'Failed to reject users');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === pendingUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pendingUsers.map((user) => user.id));
    }
  };

  const getUserIcon = (userType) => {
    switch (userType) {
      case 'company':
        return <FaBuilding className="text-warning" />;
      case 'institute':
        return <FaUniversity className="text-info" />;
      case 'entrepreneur':
        return <FaBusinessTime className="text-success" />;
      case 'youth':
        return <FaUser className="text-primary" />;
      case 'student':
        return <FaUser className="text-secondary" />;
      case 'employer':
        return <FaUser className="text-dark" />;
      default:
        return <FaUser className="text-secondary" />;
    }
  };

  const getUserTypeBadge = (userType) => {
    const types = {
      company: { label: 'Company', variant: 'warning' },
      institute: { label: 'Institute', variant: 'info' },
      entrepreneur: { label: 'Entrepreneur', variant: 'success' },
      youth: { label: 'Youth', variant: 'primary' },
      student: { label: 'Student', variant: 'secondary' },
      employer: { label: 'Employer', variant: 'dark' },
    };

    const type = types[userType] || { label: userType, variant: 'secondary' };
    return <Badge bg={type.variant}>{type.label}</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  if (!isAdmin) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>You must be an administrator to access this page.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <Button variant="outline-secondary" onClick={goBackToDashboard} className="me-3">
              <FaArrowLeft />
            </Button>
            <div>
              <h2 className="mb-0">
                <FaClipboardCheck className="me-2" />
                Pending Approvals
              </h2>
              <p className="text-muted mb-0">Review and approve/reject user registrations</p>
            </div>
          </div>
        </Col>
        <Col className="text-end">
          <Button
            variant="outline-primary"
            onClick={handleRefresh}
            disabled={refreshing}
            className="me-2"
          >
            <FaSync className={refreshing ? 'spin' : ''} />
            {refreshing ? ' Refreshing...' : ' Refresh'}
          </Button>
          <Button variant="outline-secondary" onClick={goBackToDashboard}>
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-primary h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Pending
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.total}</div>
                  <small className="text-muted">Awaiting review</small>
                </div>
                <div className="stat-icon">
                  <FaUsers className="text-primary" size="2em" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-warning h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Companies
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.companies}</div>
                  <small className="text-muted">Need verification</small>
                </div>
                <div className="stat-icon">
                  <FaBuilding className="text-warning" size="2em" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-info h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Institutes
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.institutes}</div>
                  <small className="text-muted">Universities/Colleges</small>
                </div>
                <div className="stat-icon">
                  <FaUniversity className="text-info" size="2em" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-success h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Entrepreneurs/Youth
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.entrepreneurs + stats.youth}
                  </div>
                  <small className="text-muted">Business creators</small>
                </div>
                <div className="stat-icon">
                  <FaBusinessTime className="text-success" size="2em" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Bulk Actions */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="company">Companies</option>
                  <option value="institute">Institutes</option>
                  <option value="entrepreneur">Entrepreneurs</option>
                  <option value="youth">Youth</option>
                  <option value="student">Students</option>
                  <option value="employer">Employers</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={5} className="text-end">
              <div className="d-flex justify-content-end gap-2">
                {selectedUsers.length > 0 && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleBulkApprove}
                      className="d-flex align-items-center"
                    >
                      <FaCheck className="me-1" />
                      Approve Selected ({selectedUsers.length})
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkReject}
                      className="d-flex align-items-center"
                    >
                      <FaTimes className="me-1" />
                      Reject Selected ({selectedUsers.length})
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setSelectedUsers([])}
                      className="d-flex align-items-center"
                    >
                      <FaTrash className="me-1" />
                      Clear Selection
                    </Button>
                  </>
                )}
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <FaDownload className="me-1" /> Export
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>Export as CSV</Dropdown.Item>
                    <Dropdown.Item>Export as Excel</Dropdown.Item>
                    <Dropdown.Item>Export as PDF</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading pending users...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-5">
              <FaClipboardCheck size="3em" className="text-success mb-3" />
              <h5>No pending approvals</h5>
              <p className="text-muted">All users have been reviewed and approved.</p>
              <Button variant="primary" onClick={goBackToDashboard} className="mt-2">
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }}>
                      <Form.Check
                        type="checkbox"
                        checked={
                          selectedUsers.length === pendingUsers.length && pendingUsers.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">{getUserIcon(user.userType)}</div>
                          <div>
                            <div className="fw-bold">{user.displayName || 'No Name'}</div>
                            <small className="text-muted">
                              ID: {user.id?.substring(0, 8) || 'N/A'}...
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{getUserTypeBadge(user.userType)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaEnvelope className="me-2 text-muted" size="14" />
                          <span className="text-truncate" style={{ maxWidth: '200px' }}>
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        {user.phoneNumber ? (
                          <div className="d-flex align-items-center">
                            <FaPhone className="me-2 text-muted" size="14" />
                            {user.phoneNumber}
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCalendar className="me-2 text-muted" size="14" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(user)}
                            title="View Details"
                            className="d-flex align-items-center"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowApproveModal(true);
                            }}
                            title="Approve"
                            className="d-flex align-items-center"
                          >
                            <FaCheck />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRejectModal(true);
                            }}
                            title="Reject"
                            className="d-flex align-items-center"
                          >
                            <FaTimes />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, stats.total)} of {stats.total} users
                </small>
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                />

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* User Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <Row className="mb-4">
                <Col md={4} className="text-center">
                  <div className="user-avatar mb-3">
                    <div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                      style={{ width: '80px', height: '80px' }}
                    >
                      {getUserIcon(selectedUser.userType)}
                    </div>
                  </div>
                  <h5>{selectedUser.displayName || 'No Name'}</h5>
                  {getUserTypeBadge(selectedUser.userType)}
                  <div className="mt-2">
                    <Badge bg="warning">Pending Approval</Badge>
                  </div>
                </Col>
                <Col md={8}>
                  <div className="mb-4">
                    <h6>Contact Information</h6>
                    <div className="mb-2">
                      <FaEnvelope className="me-2 text-muted" />
                      <strong>Email:</strong> {selectedUser.email}
                    </div>
                    <div className="mb-2">
                      <FaPhone className="me-2 text-muted" />
                      <strong>Phone:</strong> {selectedUser.phoneNumber || 'N/A'}
                    </div>
                    <div>
                      <FaCalendar className="me-2 text-muted" />
                      <strong>Registered:</strong> {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>

                  {/* Additional user-specific information */}
                  {selectedUser.additionalData && (
                    <div className="mb-4">
                      <h6>Additional Information</h6>
                      <div className="small">
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                          {JSON.stringify(selectedUser.additionalData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </Col>
              </Row>

              <div className="alert alert-info">
                <strong>Note:</strong> This user is currently pending approval. You can approve or
                reject their registration request.
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setShowDetailsModal(false);
              setShowApproveModal(true);
            }}
          >
            Approve User
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setShowDetailsModal(false);
              setShowRejectModal(true);
            }}
          >
            Reject User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Approve Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve User Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to approve{' '}
            <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
          </p>
          <p className="text-muted small">
            User Type: <Badge bg="info">{selectedUser?.userType}</Badge>
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Comments (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={approveComments}
              onChange={(e) => setApproveComments(e.target.value)}
              placeholder="Add any comments for the user (this will be visible to them)..."
            />
            <Form.Text className="text-muted">
              These comments will be sent to the user via email.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => handleApprove(selectedUser?.id, false, approveComments)}
          >
            Approve User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject User Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Warning:</strong> Rejecting a user will prevent them from accessing the
            platform.
          </Alert>
          <p>
            Are you sure you want to reject{' '}
            <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Reason for rejection *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a clear reason for rejection..."
              required
            />
            <Form.Text className="text-muted">
              This reason will be shared with the user via email.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleReject(selectedUser?.id, false, rejectReason)}
            disabled={!rejectReason.trim()}
          >
            Reject User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PendingApprovals;
