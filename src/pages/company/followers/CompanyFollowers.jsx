/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  InputGroup,
  Spinner,
  Pagination,
  Dropdown,
  Modal,
} from 'react-bootstrap';
import {
  FaSearch,
  FaUserCheck,
  FaChartLine,
  FaFilter,
  FaSort,
  FaEnvelope,
  FaCalendarAlt,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import './CompanyFollowers.css';

const CompanyFollowers = () => {
  const [followers, setFollowers] = useState([]);
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0 });
  const [showEngageModal, setShowEngageModal] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState([]);

  useEffect(() => {
    fetchFollowers();
  }, []);

  useEffect(() => {
    filterAndSortFollowers();
  }, [followers, searchTerm, filter, sortBy]);

  const fetchFollowers = async () => {
    // Mock data
    setTimeout(() => {
      const mockFollowers = Array.from({ length: 45 }, (_, i) => ({
        id: i + 1,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@example.com`,
        location: ['Maseru', 'Leribe', 'Berea', 'Mafeteng'][i % 4],
        education: ['High School', 'Diploma', 'Bachelor', 'Masters'][i % 4],
        skills: ['JavaScript', 'React', 'Python', 'Marketing', 'Design'].slice(0, (i % 3) + 2),
        followingSince: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ).toISOString(),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        applications: Math.floor(Math.random() * 5),
        status: ['active', 'inactive', 'new'][i % 3],
        matchScore: Math.floor(Math.random() * 30) + 70,
      }));

      setFollowers(mockFollowers);
      setStats({
        total: mockFollowers.length,
        active: mockFollowers.filter((f) => f.status === 'active').length,
        newThisMonth: Math.floor(mockFollowers.length * 0.2),
      });
      setLoading(false);
    }, 1500);
  };

  const filterAndSortFollowers = () => {
    let filtered = [...followers];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter((f) => f.status === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.followingSince) - new Date(a.followingSince);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'match':
          return b.matchScore - a.matchScore;
        case 'active':
          return new Date(b.lastActive) - new Date(a.lastActive);
        default:
          return 0;
      }
    });

    setFilteredFollowers(filtered);
  };

  const handleSelectFollower = (id) => {
    setSelectedFollowers((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFollowers.length === currentFollowers.length) {
      setSelectedFollowers([]);
    } else {
      setSelectedFollowers(currentFollowers.map((f) => f.id));
    }
  };

  const handleEngageFollowers = () => {
    if (selectedFollowers.length > 0) {
      setShowEngageModal(true);
    }
  };

  const sendBulkMessage = (messageType) => {
    console.log(`Sending ${messageType} to followers:`, selectedFollowers);
    setShowEngageModal(false);
    // Implement actual messaging
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFollowers = filteredFollowers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFollowers.length / itemsPerPage);

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffDays = Math.floor((now - past) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Container fluid className="company-followers-container px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Company Followers</h2>
          <p className="text-muted">Manage and engage with students following your company</p>
        </div>
        <Button variant="primary" onClick={() => setShowEngageModal(true)}>
          Engage Followers
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-4">
              <FaUserCheck className="text-primary mb-3" size={32} />
              <h3>{stats.total}</h3>
              <p className="text-muted mb-0">Total Followers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-4">
              <FaChartLine className="text-success mb-3" size={32} />
              <h3>{stats.active}</h3>
              <p className="text-muted mb-0">Active This Month</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-4">
              <div className="text-warning mb-3" style={{ fontSize: '32px' }}>
                ↑
              </div>
              <h3>{stats.newThisMonth}</h3>
              <p className="text-muted mb-0">New This Month</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search followers by name, email, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Followers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="new">New</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="w-100">
                  <FaSort className="me-2" />
                  Sort by:{' '}
                  {sortBy === 'recent'
                    ? 'Most Recent'
                    : sortBy === 'name'
                      ? 'Name'
                      : sortBy === 'match'
                        ? 'Best Match'
                        : 'Last Active'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSortBy('recent')}>Most Recent</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('name')}>Name (A-Z)</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('match')}>Best Match</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('active')}>Last Active</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Followers Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Followers ({filteredFollowers.length})
              {selectedFollowers.length > 0 && (
                <Badge bg="primary" className="ms-2">
                  {selectedFollowers.length} selected
                </Badge>
              )}
            </h5>
            <div className="d-flex gap-2">
              {selectedFollowers.length > 0 && (
                <Button variant="outline-primary" size="sm" onClick={handleEngageFollowers}>
                  Engage Selected
                </Button>
              )}
              <Button variant="light" size="sm" onClick={handleSelectAll}>
                {selectedFollowers.length === currentFollowers.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading followers...</p>
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
                          selectedFollowers.length === currentFollowers.length &&
                          currentFollowers.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Follower</th>
                    <th>Location</th>
                    <th>Education</th>
                    <th>Skills</th>
                    <th>Following Since</th>
                    <th>Match</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFollowers.map((follower) => (
                    <tr key={follower.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedFollowers.includes(follower.id)}
                          onChange={() => handleSelectFollower(follower.id)}
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                              style={{ width: '36px', height: '36px' }}
                            >
                              {follower.name.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <strong>{follower.name}</strong>
                            <div className="small text-muted">{follower.email}</div>
                            <Badge
                              bg={
                                follower.status === 'active'
                                  ? 'success'
                                  : follower.status === 'new'
                                    ? 'info'
                                    : 'secondary'
                              }
                              className="mt-1"
                            >
                              {follower.status}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-1 text-muted" />
                          {follower.location}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaGraduationCap className="me-1 text-muted" />
                          {follower.education}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {follower.skills.slice(0, 2).map((skill, idx) => (
                            <Badge key={idx} bg="light" text="dark" className="small">
                              {skill}
                            </Badge>
                          ))}
                          {follower.skills.length > 2 && (
                            <Badge bg="light" text="dark" className="small">
                              +{follower.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="text-muted">{getTimeAgo(follower.followingSince)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${follower.matchScore}%` }}
                            ></div>
                          </div>
                          <span>{follower.matchScore}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" title="Message">
                            <FaEnvelope />
                          </Button>
                          <Button variant="outline-success" size="sm" title="Schedule Interview">
                            <FaCalendarAlt />
                          </Button>
                          <Button variant="outline-info" size="sm" title="View Profile">
                            <FaExternalLinkAlt />
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
        {!loading && filteredFollowers.length > 0 && (
          <Card.Footer className="bg-white border-top">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Showing {indexOfFirstItem + 1} to{' '}
                {Math.min(indexOfLastItem, filteredFollowers.length)} of {filteredFollowers.length}{' '}
                followers
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Engage Modal */}
      <Modal show={showEngageModal} onHide={() => setShowEngageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Engage with Followers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Send a message or notification to {selectedFollowers.length} selected followers:</p>

          <div className="mb-3">
            <Form.Label>Select Message Type</Form.Label>
            <Form.Select>
              <option>New Job Alert</option>
              <option>Company Update</option>
              <option>Event Invitation</option>
              <option>Survey Request</option>
              <option>Custom Message</option>
            </Form.Select>
          </div>

          <div className="mb-3">
            <Form.Label>Message Content</Form.Label>
            <Form.Control as="textarea" rows={4} placeholder="Enter your message here..." />
          </div>

          <div className="alert alert-info">
            <small>
              <strong>Note:</strong> This will send notifications to all selected followers. They
              will receive this in their inbox and app notifications.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowEngageModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => sendBulkMessage('custom')}>
            Send to {selectedFollowers.length} Followers
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyFollowers;
