/* eslint-disable no-unused-vars */
// src/pages/company/ManageTeams.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Modal,
  Alert,
  Spinner,
  Badge,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  InputGroup,
} from 'react-bootstrap';
import {
  FaUsers,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaFilter,
  FaSort,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUserShield,
  FaPaperPlane,
  FaEllipsisV,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { companyFirebaseService } from '../../services/companyServices';

const ManageTeams = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'recruiter',
    department: '',
    permissions: {
      viewJobs: true,
      manageJobs: false,
      viewApplications: true,
      manageApplications: false,
      scheduleInterviews: false,
      viewAnalytics: false,
      manageTeam: false,
    },
    sendInvitation: true,
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await companyFirebaseService.getCompanyTeam();
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await companyFirebaseService.addTeamMember(formData);

      setSuccess('Team member added successfully!');
      setShowAddModal(false);
      resetForm();

      await loadTeamMembers();

      if (formData.sendInvitation) {
        sendInvitationEmail();
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      setErrors({ submit: 'Failed to add team member. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!validateForm() || !selectedMember) return;

    try {
      setLoading(true);
      await companyFirebaseService.updateTeamMember(selectedMember.id, formData);

      setSuccess('Team member updated successfully!');
      setShowEditModal(false);
      resetForm();

      await loadTeamMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
      setErrors({ submit: 'Failed to update team member. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      await companyFirebaseService.updateTeamMember(selectedMember.id, { status: 'inactive' });

      setSuccess('Team member deactivated successfully!');
      setShowDeleteModal(false);
      setSelectedMember(null);

      await loadTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitationEmail = () => {
    // In a real app, this would send an invitation email
    console.log('Invitation email sent to:', formData.email);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'recruiter',
      department: '',
      permissions: {
        viewJobs: true,
        manageJobs: false,
        viewApplications: true,
        manageApplications: false,
        scheduleInterviews: false,
        viewAnalytics: false,
        manageTeam: false,
      },
      sendInvitation: true,
    });
    setErrors({});
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: { bg: 'danger', text: 'Admin' },
      manager: { bg: 'warning', text: 'Manager' },
      recruiter: { bg: 'primary', text: 'Recruiter' },
      interviewer: { bg: 'info', text: 'Interviewer' },
      viewer: { bg: 'secondary', text: 'Viewer' },
    };

    const variant = variants[role] || { bg: 'light', text: 'dark' };

    return (
      <Badge bg={variant.bg} className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
        {variant.text}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <Badge bg="success" className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
          <FaCheckCircle className="me-1" /> Active
        </Badge>
      );
    }

    if (status === 'pending') {
      return (
        <Badge bg="warning" className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
          <FaClock className="me-1" /> Pending
        </Badge>
      );
    }

    return (
      <Badge bg="danger" className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
        <FaTimesCircle className="me-1" /> Inactive
      </Badge>
    );
  };

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'recruiter',
      department: member.department || '',
      permissions: member.permissions || {
        viewJobs: true,
        manageJobs: false,
        viewApplications: true,
        manageApplications: false,
        scheduleInterviews: false,
        viewAnalytics: false,
        manageTeam: false,
      },
      sendInvitation: false,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const filteredMembers = teamMembers.filter((member) => {
    if (filterRole !== 'all' && member.role !== filterRole) return false;
    if (filterStatus !== 'all' && member.status !== filterStatus) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        member.name?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term) ||
        member.role?.toLowerCase().includes(term) ||
        member.department?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const handlePermissionChange = (permission, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  };

  const getPermissionPreset = (role) => {
    const presets = {
      admin: {
        viewJobs: true,
        manageJobs: true,
        viewApplications: true,
        manageApplications: true,
        scheduleInterviews: true,
        viewAnalytics: true,
        manageTeam: true,
      },
      manager: {
        viewJobs: true,
        manageJobs: true,
        viewApplications: true,
        manageApplications: true,
        scheduleInterviews: true,
        viewAnalytics: true,
        manageTeam: false,
      },
      recruiter: {
        viewJobs: true,
        manageJobs: true,
        viewApplications: true,
        manageApplications: true,
        scheduleInterviews: true,
        viewAnalytics: true,
        manageTeam: false,
      },
      interviewer: {
        viewJobs: true,
        manageJobs: false,
        viewApplications: true,
        manageApplications: false,
        scheduleInterviews: true,
        viewAnalytics: false,
        manageTeam: false,
      },
      viewer: {
        viewJobs: true,
        manageJobs: false,
        viewApplications: true,
        manageApplications: false,
        scheduleInterviews: false,
        viewAnalytics: false,
        manageTeam: false,
      },
    };

    return presets[role] || presets.viewer;
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: getPermissionPreset(role),
    }));
  };

  if (loading && teamMembers.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading team members...</p>
        </div>
      </div>
    );
  }

  // Mobile card view for team members
  const TeamMemberCard = ({ member }) => (
    <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: '8px' }}>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white me-3"
              style={{ width: '40px', height: '40px', fontSize: '0.875rem' }}
            >
              {member.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>
                {member.name}
              </h6>
              <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                {member.email}
              </small>
              <div className="d-flex gap-2 mt-1">
                {getRoleBadge(member.role)}
                {getStatusBadge(member.status)}
              </div>
            </div>
          </div>
          <Dropdown>
            <Dropdown.Toggle variant="light" size="sm" className="p-1 border-0">
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleEditClick(member)}>
                <FaEdit className="me-2" /> Edit
              </Dropdown.Item>
              {member.status === 'active' && (
                <Dropdown.Item onClick={() => sendInvitationEmail()}>
                  <FaPaperPlane className="me-2" /> Send Reminder
                </Dropdown.Item>
              )}
              <Dropdown.Item onClick={() => handleDeleteClick(member)} className="text-danger">
                <FaTrash className="me-2" /> Deactivate
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="row" style={{ fontSize: '0.85rem' }}>
          <div className="col-6">
            <div className="text-muted">Department</div>
            <div>{member.department || 'Not specified'}</div>
          </div>
          <div className="col-6">
            <div className="text-muted">Contact</div>
            {member.phone ? (
              <div>
                <FaPhone className="me-1" /> {member.phone}
              </div>
            ) : (
              <div>No phone</div>
            )}
          </div>
        </div>

        <div className="mt-2" style={{ fontSize: '0.85rem' }}>
          <div className="text-muted mb-1">Permissions</div>
          <div className="d-flex flex-wrap gap-1">
            {member.permissions?.manageJobs && (
              <Badge bg="info" className="px-2 py-1">
                Jobs
              </Badge>
            )}
            {member.permissions?.manageApplications && (
              <Badge bg="info" className="px-2 py-1">
                Applications
              </Badge>
            )}
            {member.permissions?.scheduleInterviews && (
              <Badge bg="info" className="px-2 py-1">
                Interviews
              </Badge>
            )}
            {member.permissions?.viewAnalytics && (
              <Badge bg="info" className="px-2 py-1">
                Analytics
              </Badge>
            )}
            {member.permissions?.manageTeam && (
              <Badge bg="info" className="px-2 py-1">
                Team
              </Badge>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div style={{ width: '100%', overflowY: 'auto', overflowX: 'hidden', padding: '0' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #dee2e6' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <div>
            <h1 className="h4 mb-1" style={{ fontWeight: '600' }}>
              <FaUsers className="me-2 text-primary" />
              Manage Team
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
              Add and manage team members
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center gap-2"
            size="sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            <FaUserPlus /> Add Team Member
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div style={{ padding: '0 16px', marginTop: '16px' }}>
          <Alert
            variant="success"
            onClose={() => setSuccess('')}
            dismissible
            className="py-2"
            style={{ fontSize: '0.875rem' }}
          >
            <FaCheckCircle className="me-2" />
            {success}
          </Alert>
        </div>
      )}

      {/* Stats Overview */}
      <div style={{ padding: '16px 16px 0 16px' }}>
        <div className="row g-2">
          <div className="col-6 col-md-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-2 text-center">
                <h3 className="mb-1 text-primary" style={{ fontSize: '1.25rem' }}>
                  {teamMembers.length}
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                  Total Members
                </p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6 col-md-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-2 text-center">
                <h3 className="mb-1 text-success" style={{ fontSize: '1.25rem' }}>
                  {teamMembers.filter((m) => m.status === 'active').length}
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                  Active
                </p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6 col-md-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-2 text-center">
                <h3 className="mb-1 text-warning" style={{ fontSize: '1.25rem' }}>
                  {teamMembers.filter((m) => m.status === 'pending').length}
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                  Pending
                </p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6 col-md-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-2 text-center">
                <h3 className="mb-1 text-info" style={{ fontSize: '1.25rem' }}>
                  {teamMembers.filter((m) => m.role === 'recruiter').length}
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                  Recruiters
                </p>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ padding: '16px 16px 0 16px' }}>
        <div className="d-flex flex-column gap-2">
          <InputGroup size="sm">
            <InputGroup.Text className="bg-white border-end-0">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-start-0"
              style={{ fontSize: '0.875rem' }}
            />
          </InputGroup>
          <div className="d-flex gap-2">
            <Dropdown className="flex-grow-1">
              <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1 w-100"
              >
                <FaFilter /> Role: {filterRole === 'all' ? 'All' : filterRole}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
                <Dropdown.Item onClick={() => setFilterRole('all')}>All Roles</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterRole('admin')}>Admin</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterRole('manager')}>Manager</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterRole('recruiter')}>Recruiter</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterRole('interviewer')}>
                  Interviewer
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterRole('viewer')}>Viewer</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown className="flex-grow-1">
              <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1 w-100"
              >
                <FaFilter /> Status: {filterStatus === 'all' ? 'All' : filterStatus}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
                <Dropdown.Item onClick={() => setFilterStatus('all')}>All Status</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterStatus('active')}>Active</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterStatus('pending')}>Pending</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterStatus('inactive')}>Inactive</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div style={{ padding: '16px', paddingTop: '8px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
            Team Members ({filteredMembers.length})
          </h6>
        </div>

        {/* Desktop Table View */}
        <div className="d-none d-md-block">
          {filteredMembers.length > 0 ? (
            <div style={{ width: '100%', overflowX: 'hidden' }}>
              <Table hover className="mb-0" style={{ fontSize: '0.875rem' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: '200px', padding: '8px' }}>Name</th>
                    <th style={{ minWidth: '100px', padding: '8px' }}>Role</th>
                    <th style={{ minWidth: '120px', padding: '8px' }}>Department</th>
                    <th style={{ minWidth: '150px', padding: '8px' }}>Contact</th>
                    <th style={{ minWidth: '100px', padding: '8px' }}>Status</th>
                    <th style={{ minWidth: '100px', padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td style={{ padding: '8px' }}>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white me-2"
                            style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}
                          >
                            {member.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="fw-medium" style={{ fontSize: '0.875rem' }}>
                              {member.name}
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {member.email}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px' }}>{getRoleBadge(member.role)}</td>
                      <td style={{ padding: '8px' }}>
                        <span>{member.department || '-'}</span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <div className="d-flex flex-column">
                          {member.email && (
                            <small
                              className="text-muted d-flex align-items-center"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <FaEnvelope className="me-1" style={{ fontSize: '0.75rem' }} />
                              <span style={{ maxWidth: '140px' }} className="text-truncate">
                                {member.email}
                              </span>
                            </small>
                          )}
                          {member.phone && (
                            <small
                              className="text-muted d-flex align-items-center"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <FaPhone className="me-1" style={{ fontSize: '0.75rem' }} />
                              <span style={{ maxWidth: '140px' }} className="text-truncate">
                                {member.phone}
                              </span>
                            </small>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '8px' }}>{getStatusBadge(member.status)}</td>
                      <td style={{ padding: '8px' }}>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditClick(member)}
                            className="p-1"
                            style={{ minWidth: '32px' }}
                          >
                            <FaEdit />
                          </Button>

                          {member.status === 'active' && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => sendInvitationEmail()}
                              className="p-1"
                              style={{ minWidth: '32px' }}
                            >
                              <FaPaperPlane />
                            </Button>
                          )}

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(member)}
                            className="p-1"
                            style={{ minWidth: '32px' }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <FaUsers className="text-muted mb-3" style={{ fontSize: '2rem', opacity: 0.5 }} />
              <h6 style={{ fontSize: '0.875rem' }}>No team members found</h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first team member to get started'}
              </p>
              <Button variant="primary" onClick={() => setShowAddModal(true)} size="sm">
                <FaUserPlus className="me-2" /> Add Team Member
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="d-md-none">
          {filteredMembers.length > 0 ? (
            <div>
              {filteredMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <FaUsers className="text-muted mb-3" style={{ fontSize: '2rem', opacity: 0.5 }} />
              <h6 style={{ fontSize: '0.875rem' }}>No team members found</h6>
              <p className="text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first team member to get started'}
              </p>
              <Button variant="primary" onClick={() => setShowAddModal(true)} size="sm">
                <FaUserPlus className="me-2" /> Add Team Member
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="p-3 border-bottom">
          <Modal.Title className="h6 mb-0">Add Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px' }}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  isInvalid={!!errors.name}
                  size="sm"
                />
                <Form.Control.Feedback type="invalid" className="small">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="team.member@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isInvalid={!!errors.email}
                  size="sm"
                />
                <Form.Control.Feedback type="invalid" className="small">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="+266 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  isInvalid={!!errors.phone}
                  size="sm"
                />
                <Form.Control.Feedback type="invalid" className="small">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Role *</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  size="sm"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="manager">Manager</option>
                  <option value="interviewer">Interviewer</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Department</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., HR, Engineering, Marketing"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  size="sm"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Permissions</Form.Label>
                <div className="border rounded p-3" style={{ fontSize: '0.875rem' }}>
                  <div className="row">
                    <div className="col-6">
                      <Form.Check
                        type="checkbox"
                        id="viewJobs"
                        label="View Jobs"
                        checked={formData.permissions.viewJobs}
                        onChange={(e) => handlePermissionChange('viewJobs', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="manageJobs"
                        label="Manage Jobs"
                        checked={formData.permissions.manageJobs}
                        onChange={(e) => handlePermissionChange('manageJobs', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="viewApplications"
                        label="View Applications"
                        checked={formData.permissions.viewApplications}
                        onChange={(e) =>
                          handlePermissionChange('viewApplications', e.target.checked)
                        }
                        className="mb-2"
                      />
                    </div>
                    <div className="col-6">
                      <Form.Check
                        type="checkbox"
                        id="manageApplications"
                        label="Manage Applications"
                        checked={formData.permissions.manageApplications}
                        onChange={(e) =>
                          handlePermissionChange('manageApplications', e.target.checked)
                        }
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="scheduleInterviews"
                        label="Schedule Interviews"
                        checked={formData.permissions.scheduleInterviews}
                        onChange={(e) =>
                          handlePermissionChange('scheduleInterviews', e.target.checked)
                        }
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        id="viewAnalytics"
                        label="View Analytics"
                        checked={formData.permissions.viewAnalytics}
                        onChange={(e) => handlePermissionChange('viewAnalytics', e.target.checked)}
                        className="mb-2"
                      />
                    </div>
                  </div>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="sendInvitation"
                  label="Send invitation email"
                  checked={formData.sendInvitation}
                  onChange={(e) => setFormData({ ...formData, sendInvitation: e.target.checked })}
                  className="small"
                />
                <div className="text-muted small mt-1">
                  Team member will receive login instructions via email
                </div>
              </Form.Group>

              {errors.submit && (
                <Alert variant="danger" className="mt-3 py-2 small">
                  {errors.submit}
                </Alert>
              )}
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer className="p-3 border-top">
          <Button variant="light" onClick={() => setShowAddModal(false)} size="sm" className="px-3">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddMember}
            disabled={loading}
            size="sm"
            className="px-3"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              'Add Team Member'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="p-3 border-bottom">
          <Modal.Title className="h6 mb-0">Edit Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px' }}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  isInvalid={!!errors.name}
                  size="sm"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isInvalid={!!errors.email}
                  size="sm"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  size="sm"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Role</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  size="sm"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="manager">Manager</option>
                  <option value="interviewer">Interviewer</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Department</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  size="sm"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Status</Form.Label>
                <Form.Select
                  value={selectedMember?.status}
                  onChange={(e) => {
                    if (selectedMember) {
                      companyFirebaseService.updateTeamMember(selectedMember.id, {
                        status: e.target.value,
                      });
                    }
                  }}
                  size="sm"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>

              {errors.submit && (
                <Alert variant="danger" className="mt-3 py-2 small">
                  {errors.submit}
                </Alert>
              )}
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer className="p-3 border-top">
          <Button
            variant="light"
            onClick={() => setShowEditModal(false)}
            size="sm"
            className="px-3"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateMember}
            disabled={loading}
            size="sm"
            className="px-3"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Team Member'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="p-3 border-bottom">
          <Modal.Title className="h6 mb-0">Deactivate Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <Alert variant="warning" className="py-2 small mb-3">
            <FaTimesCircle className="me-2" />
            Are you sure you want to deactivate this team member?
          </Alert>
          <p className="small mb-2">
            <strong>{selectedMember?.name}</strong> will no longer be able to access the dashboard.
          </p>
          <p className="text-muted small mb-0">
            You can reactivate them at any time by editing their status.
          </p>
        </Modal.Body>
        <Modal.Footer className="p-3 border-top">
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
            size="sm"
            className="px-3"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteMember}
            disabled={loading}
            size="sm"
            className="px-3"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deactivating...
              </>
            ) : (
              'Deactivate Team Member'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageTeams;
