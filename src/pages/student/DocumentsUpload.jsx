import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  Form,
  Alert,
} from 'react-bootstrap';

const DocumentsUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const documents = [
    {
      id: 1,
      name: 'Resume_CV.pdf',
      type: 'Resume/CV',
      size: '2.4 MB',
      uploaded: '2024-01-10',
      status: 'verified',
      required: true,
    },
    {
      id: 2,
      name: 'Academic_Transcript.pdf',
      type: 'Academic Transcript',
      size: '1.8 MB',
      uploaded: '2024-01-05',
      status: 'verified',
      required: true,
    },
    {
      id: 3,
      name: 'ID_Card.jpg',
      type: 'Identification',
      size: '1.2 MB',
      uploaded: '2024-01-03',
      status: 'pending',
      required: true,
    },
    {
      id: 4,
      name: 'Cover_Letter_Software.pdf',
      type: 'Cover Letter',
      size: '0.8 MB',
      uploaded: '2024-01-12',
      status: 'verified',
      required: false,
    },
    {
      id: 5,
      name: 'Certification_React.pdf',
      type: 'Certification',
      size: '1.5 MB',
      uploaded: '2024-01-08',
      status: 'verified',
      required: false,
    },
  ];

  const requiredDocuments = [
    { id: 1, name: 'Resume/CV', description: 'Updated resume with latest experience' },
    { id: 2, name: 'Academic Transcript', description: 'Official transcript from institution' },
    { id: 3, name: 'Identification Document', description: 'National ID or Passport' },
    { id: 4, name: 'Passport Photo', description: 'Recent passport-sized photograph' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge bg="success">Verified</Badge>;
      case 'pending':
        return (
          <Badge bg="warning" text="dark">
            Pending Review
          </Badge>
        );
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">Not Uploaded</Badge>;
    }
  };

  const handleFileUpload = () => {
    setUploading(true);
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          alert('Document uploaded successfully!');
        }, 500);
      }
    }, 200);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Documents Hub</h2>

      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Keep your documents updated to increase your application success rate. Required documents
        are marked with a red asterisk (*).
      </Alert>

      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>📁 Your Documents</span>
                <Badge bg="primary">{documents.length} files</Badge>
              </Card.Title>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-file-text text-primary me-2"></i>
                            {doc.name}
                            {doc.required && <span className="text-danger ms-1">*</span>}
                          </div>
                        </td>
                        <td>{doc.type}</td>
                        <td>{doc.size}</td>
                        <td>{new Date(doc.uploaded).toLocaleDateString()}</td>
                        <td>{getStatusBadge(doc.status)}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-1">
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button variant="outline-success" size="sm" className="me-1">
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>📤 Upload New Document</Card.Title>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Document Type</Form.Label>
                  <Form.Select>
                    <option value="">Select document type</option>
                    <option value="resume">Resume/CV</option>
                    <option value="transcript">Academic Transcript</option>
                    <option value="id">Identification</option>
                    <option value="cover_letter">Cover Letter</option>
                    <option value="certificate">Certification</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Select File</Form.Label>
                  <Form.Control type="file" />
                  <Form.Text className="text-muted">
                    Max file size: 10MB. Supported formats: PDF, DOC, JPG, PNG
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control as="textarea" rows={2} />
                </Form.Group>

                {uploading ? (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <ProgressBar now={uploadProgress} animated />
                  </div>
                ) : null}

                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handleFileUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>
                      Upload Document
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>📋 Required Documents</Card.Title>
              <div className="list-group">
                {requiredDocuments.map((doc) => {
                  const isUploaded = documents.some(
                    (d) =>
                      d.type.toLowerCase().includes(doc.name.toLowerCase()) &&
                      d.status === 'verified'
                  );

                  return (
                    <div key={doc.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {doc.name}
                            <span className="text-danger ms-1">*</span>
                          </h6>
                          <p className="text-muted small mb-0">{doc.description}</p>
                        </div>
                        <Badge bg={isUploaded ? 'success' : 'danger'}>
                          {isUploaded ? '✓' : '!'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="d-flex justify-content-between mb-1">
                  <span>Document Completion</span>
                  <span>75%</span>
                </div>
                <ProgressBar now={75} variant="success" />
                <small className="text-muted">
                  3 of 4 required documents uploaded and verified
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>💡 Tips for Document Management</Card.Title>
          <Row>
            <Col md={4}>
              <div className="text-center p-3">
                <div className="bg-primary-subtle p-3 rounded-circle d-inline-flex mb-3">
                  <i className="bi bi-file-pdf text-primary" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h6>Use PDF Format</h6>
                <p className="text-muted small">Save documents as PDF for better compatibility</p>
              </div>
            </Col>

            <Col md={4}>
              <div className="text-center p-3">
                <div className="bg-success-subtle p-3 rounded-circle d-inline-flex mb-3">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h6>Keep Updated</h6>
                <p className="text-muted small">Update your resume every 3-6 months</p>
              </div>
            </Col>

            <Col md={4}>
              <div className="text-center p-3">
                <div className="bg-warning-subtle p-3 rounded-circle d-inline-flex mb-3">
                  <i className="bi bi-shield-check text-warning" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h6>Privacy First</h6>
                <p className="text-muted small">Remove sensitive information before sharing</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="text-center mt-4">
        <Button variant="primary" size="lg" className="me-3">
          <i className="bi bi-cloud-arrow-down me-2"></i>
          Download All Documents
        </Button>
        <Button variant="outline-secondary" size="lg">
          <i className="bi bi-printer me-2"></i>
          Print Summary
        </Button>
      </div>
    </Container>
  );
};

export default DocumentsUpload;
