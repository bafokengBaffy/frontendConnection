/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Spinner,
  Modal,
  InputGroup,
} from 'react-bootstrap';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

import { db } from '../../config/firebase';

function StudentManagement() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    lastContact: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsCollection = collection(db, 'users');
      const q = query(studentsCollection, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(q);

      const studentsList = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        enrollmentDate:
          doc.data().createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
        lastActivity: doc.data().lastLogin?.toDate().toLocaleDateString() || 'Never',
      }));

      setStudents(studentsList);
      setFilteredStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setFormData({
      status: student.status || 'active',
      notes: student.adminNotes || '',
      lastContact: student.lastContact || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (selectedStudent) {
        const studentRef = doc(db, 'users', selectedStudent.id);
        await updateDoc(studentRef, {
          status: formData.status,
          adminNotes: formData.notes,
          lastContact: formData.lastContact,
          updatedAt: new Date(),
        });

        // Update local state
        setStudents((prev) =>
          prev.map((s) => (s.id === selectedStudent.id ? { ...s, ...formData } : s))
        );

        setShowModal(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'inactive':
        return <Badge bg="secondary">Inactive</Badge>;
      case 'graduated':
        return <Badge bg="info">Graduated</Badge>;
      case 'suspended':
        return <Badge bg="danger">Suspended</Badge>;
      default:
        return <Badge bg="warning">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Student Management...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">Student Management</h1>
          <p className="text-muted mb-0">Manage student profiles and track progress</p>
        </div>
        <Button variant="primary" onClick={() => {}}>
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <h3 className="fw-bold">{students.length}</h3>
              <p className="text-muted mb-0">Total Students</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <h3 className="fw-bold">{students.filter((s) => s.status === 'active').length}</h3>
              <p className="text-muted mb-0">Active Students</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <h3 className="fw-bold">{students.filter((s) => s.status === 'graduated').length}</h3>
              <p className="text-muted mb-0">Graduated</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <h3 className="fw-bold">{students.filter((s) => s.status === 'inactive').length}</h3>
              <p className="text-muted mb-0">Inactive</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  placeholder="Search students by name, email, or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <i className="fas fa-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="outline-primary" className="w-100">
                Advanced Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Students Table */}
      <Card className="mb-4">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Enrollment Date</th>
                <th>Status</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.studentId || 'N/A'}</strong>
                  </td>
                  <td>
                    <strong>{student.fullName || 'Unnamed Student'}</strong>
                    <div className="small text-muted">{student.phone || 'No phone'}</div>
                  </td>
                  <td>{student.email}</td>
                  <td>{student.course || 'Not specified'}</td>
                  <td>{student.enrollmentDate}</td>
                  <td>{getStatusBadge(student.status)}</td>
                  <td>{student.lastActivity}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => handleViewDetails(student)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() => {
                        /* View profile */
                      }}
                    >
                      Profile
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Student Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Student Details - {selectedStudent?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  <div className="text-center">
                    <div
                      className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <span className="text-white h4">
                        {selectedStudent.fullName?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <h6>{selectedStudent.fullName}</h6>
                    <p className="text-muted small">{selectedStudent.studentId}</p>
                  </div>
                </Col>
                <Col md={9}>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>Email:</strong> {selectedStudent.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedStudent.phone || 'N/A'}
                      </p>
                      <p>
                        <strong>Course:</strong> {selectedStudent.course || 'N/A'}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Enrollment Date:</strong> {selectedStudent.enrollmentDate}
                      </p>
                      <p>
                        <strong>Last Activity:</strong> {selectedStudent.lastActivity}
                      </p>
                      <p>
                        <strong>Current Status:</strong> {getStatusBadge(selectedStudent.status)}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Update Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, status: e.target.value }))
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Contact Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.lastContact}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, lastContact: e.target.value }))
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Admin Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this student..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Skills & Competencies</Form.Label>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {selectedStudent.skills?.map((skill, index) => (
                      <Badge key={index} bg="info" className="p-2">
                        {skill}
                      </Badge>
                    )) || <span className="text-muted">No skills listed</span>}
                  </div>
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default StudentManagement;
