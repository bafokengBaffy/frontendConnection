import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import {
  FaUsers,
  FaUser,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaSync,
  FaDownload,
  FaLock,
  FaUnlock,
  FaBan,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { adminService } from '../../services/adminService';
import { userService } from '../../services/userService';

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const { addSuccessNotification, addErrorNotification } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    rejected: 0
  });
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    userType: 'student',
    phoneNumber: '',
    status: 'active'
  });
  const [editUser, setEditUser] = useState({});
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const itemsPerPage = 15;

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadStats();
    }
  }, [isAdmin, currentPage, filterStatus, filterType, sortField, sortDirection, activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Build filters based on active tab
      let filters = { status: filterStatus, userType: filterType };
      
      if (activeTab !== 'all') {
        filters.status = activeTab;
      }
      
      const result = await adminService.users.getAllUsers(currentPage, itemsPerPage, filters);
      
      // Apply sorting
      let sortedUsers = [...result.users];
      sortedUsers.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        sortedUsers = sortedUsers.filter(user => 
          user.email?.toLowerCase().includes(term) ||
          user.displayName?.toLowerCase().includes(term) ||
          user.phoneNumber?.includes(term) ||
          user.userType?.toLowerCase().includes(term)
        );
      }
      
      setUsers(sortedUsers);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
      addErrorNotification('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
    loadStats();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-muted" />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleViewDetails = async (userId) => {
    try {
      const userDetails = await adminService.users.getUserDetails(userId);
      setSelectedUser(userDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      addErrorNotification('Error', 'Failed to load user details');
    }
  };

  const handleEdit = (user) => {
    setEditUser({ ...user });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      await adminService.users.updateUser(editUser.id, editUser);
      addSuccessNotification('Success', 'User updated successfully');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      addErrorNotification('Error', 'Failed to update user');
    }
  };

  const handleSuspend = async () => {
    try {
      await adminService.users.suspendUser(selectedUser.id, suspendReason);
      addSuccessNotification('Success', 'User suspended successfully');
      setShowSuspendModal(false);
      setSuspendReason('');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error suspending user:', error);
      addErrorNotification('Error', 'Failed to suspend user');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await adminService.users.activateUser(userId);
      addSuccessNotification('Success', 'User activated successfully');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error activating user:', error);
      addErrorNotification('Error', 'Failed to activate user');
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.users.deleteUser(selectedUser.id, deleteReason);
      addSuccessNotification('Success', 'User deleted successfully');
      setShowDeleteModal(false);
      setDeleteReason('');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      addErrorNotification('Error', 'Failed to delete user');
    }
  };

  const handleCreateUser = async () => {
    try {
      await adminService.users.createUser(newUser);
      addSuccessNotification('Success', 'User created successfully');
      setShowCreateModal(false);
      setNewUser({
        email: '',
        password: '',
        displayName: '',
        userType: 'student',
        phoneNumber: '',
        status: 'active'
      });
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error creating user:', error);
      addErrorNotification('Error', 'Failed to create user');
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminService.users.approveUser(userId, 'Manual approval');
      addSuccessNotification('Success', 'User approved successfully');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error approving user:', error);
      addErrorNotification('Error', 'Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await adminService.users.rejectUser(userId, reason);
      addSuccessNotification('Success', 'User rejected successfully');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error rejecting user:', error);
      addErrorNotification('Error', 'Failed to reject user');
    }
  };

  const getUserTypeBadge = (userType) => {
    const types = {
      admin: { label: 'Admin', variant: 'danger' },
      company: { label: 'Company', variant: 'warning' },
      institute: { label: 'Institute', variant: 'info' },
      entrepreneur: { label: 'Entrepreneur', variant: 'success' },
      youth: { label: 'Youth', variant: 'primary' },
      student: { label: 'Student', variant: 'secondary' },
      employer: { label: 'Employer', variant: 'dark' }
    };
    
    const type = types[userType] || { label: userType, variant: 'secondary' };
    return <Badge bg={type.variant}>{type.label}</Badge>;
  };

  const getUserStatusBadge = (status) => {
    const statuses = {
      active: { label: 'Active', variant: 'success', icon: <FaCheckCircle /> },
      pending: { label: 'Pending', variant: 'warning', icon: <FaExclamationTriangle /> },
      suspended: { label: 'Suspended', variant: 'danger', icon: <FaBan /> },
      rejected: { label: 'Rejected', variant: 'secondary', icon: <FaTimes /> },
      deleted: { label: 'Deleted', variant: 'dark', icon: <FaTrash /> }
    };
    
    const statusInfo = statuses[status] || { label: status, variant: 'secondary', icon: <FaInfoCircle /> };
    return (
      <Badge bg={statusInfo.variant} className="d-flex align-items-center gap-1">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'User Type', 'Status', 'Phone', 'Registered', 'Last Updated'];
    const csvData = users.map(user => [
      user.displayName,
      user.email,
      user.userType,
      user.status,
      user.phoneNumber || 'N/A',
      formatDate(user.createdAt),
      formatDate(user.updatedAt)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h2 className="mb-0">
            <FaUsers className="me-2" />
            User Management
          </h2>
          <p className="text-muted mb-0">Manage all users in the system</p>
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
          <Button 
            variant="outline-secondary" 
            onClick={exportToCSV}
            className="me-2"
          >
            <FaDownload className="me-1" />
            Export CSV
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FaUserPlus className="me-1" />
            Add User
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
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.total}
                  </div>
                </div>
                <div className="stat-icon">
                  <FaUsers className="text-primary" size="2em" />
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
                    Active Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.active}
                  </div>
                </div>
                <div className="stat-icon">
                  <FaCheckCircle className="text-success" size="2em" />
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
                    Pending Approval
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.pending}
                  </div>
                </div>
                <div className="stat-icon">
                  <FaExclamationTriangle className="text-warning" size="2em" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-danger h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    Suspended Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.suspended}
                  </div>
                </div>
                <div className="stat-icon">
                  <FaBan className="text-danger" size="2em" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card className="mb-4">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="all" title="All Users" />
            <Tab eventKey="active" title="Active" />
            <Tab eventKey="pending" title="Pending" />
            <Tab eventKey="suspended" title="Suspended" />
            <Tab eventKey="rejected" title="Rejected" />
          </Tabs>
        </Card.Body>
      </Card>

      {/* Filters */}
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
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="admin">Admin</option>
                <option value="company">Company</option>
                <option value="institute">Institute</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="youth">Youth</option>
                <option value="student">Student</option>
                <option value="employer">Employer</option>
              </Form.Select>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={activeTab !== 'all'}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                  setActiveTab('all');
                }}
              >
                <FaFilter className="me-1" />
                Clear Filters
              </Button>
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
              <p className="mt-3">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <FaUsers size="3em" className="text-muted mb-3" />
              <h5>No users found</h5>
              <p className="text-muted">Try changing your filters</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th onClick={() => handleSort('userType')} style={{ cursor: 'pointer' }}>
                      <div className="d-flex align-items-center gap-1">
                        Type
                        {getSortIcon('userType')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      <div className="d-flex align-items-center gap-1">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th>Contact</th>
                    <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                      <div className="d-flex align-items-center gap-1">
                        Registered
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <FaUser className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-bold">{user.displayName}</div>
                            <small className="text-muted">ID: {user.id.substring(0, 8)}...</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getUserTypeBadge(user.userType)}
                      </td>
                      <td>
                        {getUserStatusBadge(user.status)}
                      </td>
                      <td>
                        <div className="mb-1">
                          <FaEnvelope className="me-2 text-muted" size="12" />
                          <small>{user.email}</small>
                        </div>
                        {user.phoneNumber && (
                          <div>
                            <FaPhone className="me-2 text-muted" size="12" />
                            <small>{user.phoneNumber}</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="mb-1">
                          <FaCalendar className="me-2 text-muted" size="12" />
                          <small>{formatDate(user.createdAt)}</small>
                        </div>
                        {user.updatedAt && user.updatedAt !== user.createdAt && (
                          <div>
                            <small className="text-muted">Updated: {formatDate(user.updatedAt)}</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>View Details</Tooltip>}
                          >
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(user.id)}
                            >
                              <FaEye />
                            </Button>
                          </OverlayTrigger>
                          
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit User</Tooltip>}
                          >
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <FaEdit />
                            </Button>
                          </OverlayTrigger>
                          
                          {user.status === 'pending' && (
                            <>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Approve</Tooltip>}
                              >
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleApprove(user.id)}
                                >
                                  <FaCheck />
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Reject</Tooltip>}
                              >
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleReject(user.id)}
                                >
                                  <FaTimes />
                                </Button>
                              </OverlayTrigger>
                            </>
                          )}
                          
                          {user.status === 'active' && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Suspend User</Tooltip>}
                            >
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowSuspendModal(true);
                                }}
                              >
                                <FaLock />
                              </Button>
                            </OverlayTrigger>
                          )}
                          
                          {user.status === 'suspended' && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Activate User</Tooltip>}
                            >
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleActivate(user.id)}
                              >
                                <FaUnlock />
                              </Button>
                            </OverlayTrigger>
                          )}
                          
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete User</Tooltip>}
                          >
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FaTrash />
                            </Button>
                          </OverlayTrigger>
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, users.length)} of users
                </small>
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Modals */}
      {/* User Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              {/* User details content */}
              <p>User details would be displayed here...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create User Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="user@example.com"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Minimum 6 characters"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Display Name</Form.Label>
              <Form.Control
                type="text"
                value={newUser.displayName}
                onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                placeholder="User's name"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>User Type *</Form.Label>
                  <Form.Select
                    value={newUser.userType}
                    onChange={(e) => setNewUser({...newUser, userType: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="company">Company</option>
                    <option value="institute">Institute</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="youth">Youth</option>
                    <option value="employer">Employer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                placeholder="+266 1234 5678"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleCreateUser}
            disabled={!newUser.email || !newUser.password}
          >
            Create User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Display Name</Form.Label>
              <Form.Control
                type="text"
                value={editUser.displayName || ''}
                onChange={(e) => setEditUser({...editUser, displayName: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>User Type</Form.Label>
              <Form.Select
                value={editUser.userType || 'student'}
                onChange={(e) => setEditUser({...editUser, userType: e.target.value})}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="company">Company</option>
                <option value="institute">Institute</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="youth">Youth</option>
                <option value="employer">Employer</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={editUser.status || 'active'}
                onChange={(e) => setEditUser({...editUser, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={editUser.phoneNumber || ''}
                onChange={(e) => setEditUser({...editUser, phoneNumber: e.target.value})}
                placeholder="+266 1234 5678"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Email Verified"
                checked={editUser.emailVerified || false}
                onChange={(e) => setEditUser({...editUser, emailVerified: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Suspend User Modal */}
      <Modal
        show={showSuspendModal}
        onHide={() => setShowSuspendModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Suspend User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to suspend <strong>{selectedUser?.displayName}</strong>?
          </p>
          <Form.Group>
            <Form.Label>Reason for suspension *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Provide a reason for suspension..."
              required
            />
            <Form.Text className="text-muted">
              This reason will be shared with the user.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuspendModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="warning"
            onClick={handleSuspend}
            disabled={!suspendReason.trim()}
          >
            Suspend User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning:</strong> This action cannot be undone. The user will be marked as deleted.
          </Alert>
          <p>
            Are you sure you want to delete <strong>{selectedUser?.displayName}</strong>?
          </p>
          <Form.Group>
            <Form.Label>Reason for deletion (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Provide a reason for deletion..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;
