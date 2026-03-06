/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Badge,
  Table,
  Pagination,
  Spinner,
  Alert,
  Modal,
} from 'react-bootstrap';
import { Search, Filter, Person, Building, Star, Eye, Download } from 'react-bootstrap-icons';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import './SearchStudents.css';

const SearchStudents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    institution: '',
    location: '',
    skills: '',
    graduationYear: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 10;

  // Format current date for display
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch students from Firestore
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsRef = collection(db, 'users');
      const q = query(studentsRef, where('userType', '==', 'student'));
      const querySnapshot = await getDocs(q);

      const studentsList = [];
      for (const docSnapshot of querySnapshot.docs) {
        const studentData = docSnapshot.data();

        // Fetch additional student details if available
        try {
          const studentDetailsRef = doc(db, 'students', docSnapshot.id);
          const studentDetailsDoc = await getDoc(studentDetailsRef);
          if (studentDetailsDoc.exists()) {
            Object.assign(studentData, studentDetailsDoc.data());
          }
        } catch (err) {
          console.log('No additional student details found:', err.message);
        }

        studentsList.push({
          id: docSnapshot.id,
          ...studentData,
        });
      }

      setStudents(studentsList);
      setFilteredStudents(studentsList);
      setError('');
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...students];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          (student.name && student.name.toLowerCase().includes(term)) ||
          (student.email && student.email.toLowerCase().includes(term)) ||
          (student.course && student.course.toLowerCase().includes(term)) ||
          (student.institution && student.institution.toLowerCase().includes(term)) ||
          (student.skills && Array.isArray(student.skills)
            ? student.skills.some((skill) => skill.toLowerCase().includes(term))
            : student.skills && student.skills.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filters.course) {
      result = result.filter((student) => student.course && student.course === filters.course);
    }

    if (filters.institution) {
      result = result.filter(
        (student) => student.institution && student.institution === filters.institution
      );
    }

    if (filters.location) {
      result = result.filter(
        (student) => student.location && student.location === filters.location
      );
    }

    if (filters.skills) {
      result = result.filter(
        (student) =>
          student.skills &&
          (Array.isArray(student.skills)
            ? student.skills.includes(filters.skills)
            : student.skills === filters.skills)
      );
    }

    if (filters.graduationYear) {
      result = result.filter(
        (student) => student.graduationYear && student.graduationYear === filters.graduationYear
      );
    }

    setFilteredStudents(result);
    setCurrentPage(1);
  }, [searchTerm, filters, students]);

  // Get unique values for filter dropdowns
  const courses = useMemo(() => {
    const uniqueCourses = [...new Set(students.map((s) => s.course).filter(Boolean))];
    return uniqueCourses.sort();
  }, [students]);

  const institutions = useMemo(() => {
    const uniqueInstitutions = [...new Set(students.map((s) => s.institution).filter(Boolean))];
    return uniqueInstitutions.sort();
  }, [students]);

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(students.map((s) => s.location).filter(Boolean))];
    return uniqueLocations.sort();
  }, [students]);

  const allSkills = useMemo(() => {
    const skillsSet = new Set();
    students.forEach((student) => {
      if (student.skills) {
        if (Array.isArray(student.skills)) {
          student.skills.forEach((skill) => skillsSet.add(skill));
        } else {
          skillsSet.add(student.skills);
        }
      }
    });
    return [...skillsSet].sort();
  }, [students]);

  const graduationYears = useMemo(() => {
    const uniqueYears = [...new Set(students.map((s) => s.graduationYear).filter(Boolean))];
    return uniqueYears.sort((a, b) => b - a);
  }, [students]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      course: '',
      institution: '',
      location: '',
      skills: '',
      graduationYear: '',
    });
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const sendMessage = (studentId) => {
    console.log('Send message to student:', studentId);
    // Implement messaging functionality
  };

  const saveCandidate = (studentId) => {
    console.log('Save candidate:', studentId);
    // Implement save candidate functionality
  };

  return (
    <Container className="SearchStudents-page mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Find Candidates</h1>
              <p className="text-muted">{formattedDate} | Company View</p>
            </div>
            <div>
              <Button variant="outline-secondary" onClick={clearFilters} className="me-2">
                <Filter className="me-1" /> Clear Filters
              </Button>
              <Button variant="primary" onClick={fetchStudents}>
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search students by name, email, course, institution, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary">Search</Button>
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h6">Filters</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Course</Form.Label>
                    <Form.Select name="course" value={filters.course} onChange={handleFilterChange}>
                      <option value="">All Courses</option>
                      {courses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Institution</Form.Label>
                    <Form.Select
                      name="institution"
                      value={filters.institution}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Institutions</option>
                      {institutions.map((institution) => (
                        <option key={institution} value={institution}>
                          {institution}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Skills</Form.Label>
                    <Form.Select name="skills" value={filters.skills} onChange={handleFilterChange}>
                      <option value="">All Skills</option>
                      {allSkills.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Graduation Year</Form.Label>
                    <Form.Select
                      name="graduationYear"
                      value={filters.graduationYear}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Years</option>
                      {graduationYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Results */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title as="h5" className="mb-0">
                {filteredStudents.length} Students Found
              </Card.Title>
              <Badge bg="primary" pill>
                Page {currentPage} of {totalPages}
              </Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading students...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : filteredStudents.length === 0 ? (
                <Alert variant="info">No students found matching your criteria.</Alert>
              ) : (
                <>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course & Institution</th>
                        <th>Location</th>
                        <th>Skills</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStudents.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="student-avatar me-3">
                                {student.photoURL ? (
                                  <img
                                    src={student.photoURL}
                                    alt={student.name}
                                    className="rounded-circle"
                                    width="40"
                                    height="40"
                                  />
                                ) : (
                                  <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px' }}
                                  >
                                    <Person size={20} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <strong>{student.name || 'Unnamed Student'}</strong>
                                <div className="small text-muted">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="small text-muted">
                                <Building className="me-2" size={14} />
                                {student.institution || 'Not specified'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>{student.location || 'Not specified'}</div>
                          </td>
                          <td>
                            {student.skills ? (
                              Array.isArray(student.skills) ? (
                                <div className="d-flex flex-wrap gap-1">
                                  {student.skills.slice(0, 3).map((skill, index) => (
                                    <Badge key={index} bg="light" text="dark" className="me-1">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {student.skills.length > 3 && (
                                    <Badge bg="secondary">+{student.skills.length - 3}</Badge>
                                  )}
                                </div>
                              ) : (
                                <Badge bg="light" text="dark">
                                  {student.skills}
                                </Badge>
                              )
                            ) : (
                              <span className="text-muted">No skills listed</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={student.status === 'available' ? 'success' : 'warning'}>
                              {student.status === 'available' ? 'Available' : 'Seeking'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => viewStudentDetails(student)}
                              >
                                <Eye className="me-1" /> View
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => sendMessage(student.id)}
                              ></Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => saveCandidate(student.id)}
                              >
                                <Star className="me-1" /> Save
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.First
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        />

                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <Pagination.Item
                                key={pageNumber}
                                active={pageNumber === currentPage}
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </Pagination.Item>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return <Pagination.Ellipsis key={pageNumber} />;
                          }
                          return null;
                        })}

                        <Pagination.Next
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Student Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <Row>
              <Col md={4} className="text-center">
                {selectedStudent.photoURL ? (
                  <img
                    src={selectedStudent.photoURL}
                    alt={selectedStudent.name}
                    className="rounded-circle mb-3"
                    width="120"
                    height="120"
                  />
                ) : (
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <Person size={48} />
                  </div>
                )}
                <h4>{selectedStudent.name}</h4>
                <p className="text-muted">{selectedStudent.email}</p>
                <div className="mb-3">
                  <Badge bg={selectedStudent.status === 'available' ? 'success' : 'warning'}>
                    {selectedStudent.status === 'available'
                      ? 'Available for Opportunities'
                      : 'Actively Seeking'}
                  </Badge>
                </div>
                <Button variant="primary" className="me-2"></Button>
                <Button variant="outline-primary">
                  <Download className="me-1" /> Download CV
                </Button>
              </Col>
              <Col md={8}>
                <h5>Academic Information</h5>
                <Row className="mb-3">
                  <Col>
                    <strong>Course:</strong> {selectedStudent.course || 'Not specified'}
                  </Col>
                  <Col>
                    <strong>Institution:</strong> {selectedStudent.institution || 'Not specified'}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <strong>Location:</strong> {selectedStudent.location || 'Not specified'}
                  </Col>
                  <Col>
                    <strong>Graduation Year:</strong>{' '}
                    {selectedStudent.graduationYear || 'Not specified'}
                  </Col>
                </Row>

                <h5 className="mt-4">Skills</h5>
                <div className="mb-4">
                  {selectedStudent.skills ? (
                    Array.isArray(selectedStudent.skills) ? (
                      <div className="d-flex flex-wrap gap-2">
                        {selectedStudent.skills.map((skill, index) => (
                          <Badge key={index} bg="primary" className="p-2">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge bg="primary" className="p-2">
                        {selectedStudent.skills}
                      </Badge>
                    )
                  ) : (
                    <p className="text-muted">No skills listed</p>
                  )}
                </div>

                <h5>About</h5>
                <p className="text-muted">
                  {selectedStudent.bio ||
                    selectedStudent.description ||
                    'No additional information provided.'}
                </p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button variant="primary">Save to Talent Pool</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SearchStudents;
