/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, 
  Table, Modal, Alert, Spinner, Badge, 
  Dropdown, OverlayTrigger, Tooltip, InputGroup,
  ProgressBar, ListGroup
} from 'react-bootstrap';
import { 
  FaFileAlt, FaUpload, FaDownload, FaTrash, 
  FaSearch, FaFilter, FaFolder, FaFilePdf,
  FaFileWord, FaFileExcel, FaFileImage, FaFileArchive,
  FaEye, FaEdit, FaShareAlt, FaCopy, FaCalendarAlt,
  FaUser, FaSortAmountDown, FaSortAmountUp, FaCloudUploadAlt,
  FaCheckCircle, FaTimesCircle, FaLock, FaUnlock,
  FaFolderPlus, FaTags, FaExternalLinkAlt
} from 'react-icons/fa';
import { companyFirebaseService } from '../../services/companyServices';

const DocumentHub = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: '',
    accessLevel: 'private'
  });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await companyFirebaseService.getCompanyDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setErrors({ file: 'File size must be less than 50MB' });
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors({ file: 'File type not supported' });
        return;
      }
      
      setFile(selectedFile);
      setFormData(prev => ({
        ...prev,
        name: selectedFile.name.replace(/\.[^/.]+$/, "") // Remove extension
      }));
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!file) {
      newErrors.file = 'Please select a file to upload';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Document name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateUploadProgress = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const handleUpload = async () => {
    if (!validateForm()) return;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      await simulateUploadProgress();
      
      // Upload file to Firebase
      const metadata = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        accessLevel: formData.accessLevel
      };
      
      await companyFirebaseService.uploadDocument(file, metadata);
      
      setSuccess('Document uploaded successfully!');
      setShowUploadModal(false);
      resetForm();
      
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      setErrors({ submit: 'Failed to upload document. Please try again.' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      setLoading(true);
      await companyFirebaseService.deleteDocument(selectedDocument.id);
      
      setSuccess('Document deleted successfully!');
      setShowDeleteModal(false);
      setSelectedDocument(null);
      
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      // In a real app, this would trigger download
      window.open(document.downloadURL, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleShare = (document) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const copyShareLink = (document) => {
    navigator.clipboard.writeText(document.downloadURL);
    setSuccess('Share link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      tags: '',
      accessLevel: 'private'
    });
    setFile(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return <FaFilePdf className="text-danger" />;
    } else if (fileType?.includes('word') || fileType?.includes('msword')) {
      return <FaFileWord className="text-primary" />;
    } else if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) {
      return <FaFileExcel className="text-success" />;
    } else if (fileType?.includes('image')) {
      return <FaFileImage className="text-info" />;
    } else if (fileType?.includes('zip') || fileType?.includes('rar') || fileType?.includes('archive')) {
      return <FaFileArchive className="text-warning" />;
    } else {
      return <FaFileAlt className="text-secondary" />;
    }
  };

  const getFileType = (fileName) => {
    if (!fileName) return 'Unknown';
    const extension = fileName.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
      'jpg': 'JPEG Image',
      'jpeg': 'JPEG Image',
      'png': 'PNG Image',
      'gif': 'GIF Image',
      'txt': 'Text File',
      'zip': 'ZIP Archive',
      'rar': 'RAR Archive'
    };
    
    return typeMap[extension] || 'File';
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterType !== 'all' && doc.category !== filterType) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        doc.name?.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      case 'oldest':
        return new Date(a.uploadedAt) - new Date(b.uploadedAt);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'size':
        return (b.fileSize || 0) - (a.fileSize || 0);
      default:
        return 0;
    }
  });

  const categories = [
    'general',
    'hr-policies',
    'templates',
    'reports',
    'legal',
    'marketing',
    'technical',
    'training'
  ];

  const getCategoryBadge = (category) => {
    const variants = {
      'general': { bg: 'secondary', text: 'General' },
      'hr-policies': { bg: 'primary', text: 'HR Policies' },
      'templates': { bg: 'info', text: 'Templates' },
      'reports': { bg: 'success', text: 'Reports' },
      'legal': { bg: 'warning', text: 'Legal' },
      'marketing': { bg: 'danger', text: 'Marketing' },
      'technical': { bg: 'dark', text: 'Technical' },
      'training': { bg: 'light', text: 'dark' }
    };
    
    const variant = variants[category] || { bg: 'light', text: 'dark' };
    
    return (
      <Badge bg={variant.bg} className="px-2 py-1">
        {variant.text}
      </Badge>
    );
  };

  if (loading && documents.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading documents...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-2">
                <FaFileAlt className="me-2 text-primary" />
                Document Hub
              </h1>
              <p className="text-muted mb-0">
                Store and manage all your company documents in one place
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowUploadModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <FaUpload /> Upload Document
            </Button>
          </div>
        </Col>
      </Row>

      {success && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              <FaCheckCircle className="me-2" />
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Stats Overview */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-primary">{documents.length}</h2>
              <p className="text-muted mb-0">Total Documents</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-info">
                {documents.filter(d => d.fileType?.includes('pdf')).length}
              </h2>
              <p className="text-muted mb-0">PDF Files</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-success">
                {documents.filter(d => d.fileType?.includes('image')).length}
              </h2>
              <p className="text-muted mb-0">Images</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-warning">
                {formatFileSize(documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0))}
              </h2>
              <p className="text-muted mb-0">Total Storage Used</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={8}>
          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Search documents by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </div>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center gap-2">
                <FaFilter /> Category: {filterType === 'all' ? 'All' : filterType}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilterType('all')}>All Categories</Dropdown.Item>
                {categories.map(category => (
                  <Dropdown.Item key={category} onClick={() => setFilterType(category)}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center gap-2">
                {sortBy === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                Sort
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSortBy('newest')}>Newest First</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy('oldest')}>Oldest First</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy('name')}>Name A-Z</Dropdown.Item>
                <Dropdown.Item onClick={() => setSortBy('size')}>Size</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>

      {/* Documents Grid/List View */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Documents ({filteredDocuments.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredDocuments.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Document</th>
                        <th>Category</th>
                        <th>Type & Size</th>
                        <th>Uploaded</th>
                        <th>Access</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-3" style={{ fontSize: '1.5rem' }}>
                                {getFileIcon(doc.fileType)}
                              </div>
                              <div>
                                <div className="fw-medium">{doc.name}</div>
                                {doc.description && (
                                  <small className="text-muted d-block">{doc.description}</small>
                                )}
                                {doc.tags && doc.tags.length > 0 && (
                                  <div className="mt-1">
                                    {doc.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} bg="light" text="dark" className="me-1">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {doc.tags.length > 2 && (
                                      <Badge bg="light" text="dark">
                                        +{doc.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {getCategoryBadge(doc.category)}
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <small>{getFileType(doc.fileName)}</small>
                              <small className="text-muted">{formatFileSize(doc.fileSize)}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <small>{formatDate(doc.uploadedAt)}</small>
                              <small className="text-muted">
                                <FaUser className="me-1" /> Uploaded
                              </small>
                            </div>
                          </td>
                          <td>
                            {doc.accessLevel === 'public' ? (
                              <Badge bg="success" className="d-flex align-items-center gap-1 px-2 py-1">
                                <FaUnlock /> Public
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="d-flex align-items-center gap-1 px-2 py-1">
                                <FaLock /> Private
                              </Badge>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <OverlayTrigger overlay={<Tooltip>Preview</Tooltip>}>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => window.open(doc.downloadURL, '_blank')}
                                >
                                  <FaEye />
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger overlay={<Tooltip>Download</Tooltip>}>
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleDownload(doc)}
                                >
                                  <FaDownload />
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger overlay={<Tooltip>Share</Tooltip>}>
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleShare(doc)}
                                >
                                  <FaShareAlt />
                                </Button>
                              </OverlayTrigger>
                              
                              <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDocument(doc);
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
              ) : (
                <div className="text-center py-5">
                  <FaFileAlt className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.5 }} />
                  <h5>No documents found</h5>
                  <p className="text-muted mb-3">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Upload your first document to get started'}
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowUploadModal(true)}
                  >
                    <FaUpload className="me-2" /> Upload Document
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upload Document Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Upload Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {uploading ? (
            <div className="text-center py-4">
              <FaCloudUploadAlt className="text-primary mb-3" style={{ fontSize: '3rem' }} />
              <h5>Uploading Document</h5>
              <p className="text-muted mb-3">Please wait while we upload your document...</p>
              <ProgressBar 
                now={uploadProgress} 
                label={`${uploadProgress}%`} 
                variant="primary" 
                animated 
                className="mb-3"
              />
              <p className="text-muted small">
                Uploading: {file?.name}
              </p>
            </div>
          ) : (
            <Form>
              {/* File Upload Area */}
              <div 
                className="border rounded p-5 text-center mb-4 cursor-pointer hover-highlight"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderStyle: 'dashed', borderWidth: '2px' }}
              >
                <FaCloudUploadAlt className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.5 }} />
                <h5>Click to select file or drag and drop</h5>
                <p className="text-muted mb-3">
                  Max file size: 50MB. Supported: PDF, Word, Excel, Images, Text, Archives
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                />
                <Button variant="outline-primary">
                  Browse Files
                </Button>
              </div>

              {file && (
                <Alert variant="info" className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      {getFileIcon(file.type)}
                      <div className="ms-3">
                        <strong>{file.name}</strong>
                        <div className="small text-muted">
                          {formatFileSize(file.size)} • {getFileType(file.name)}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="link" 
                      className="text-danger"
                      onClick={() => {
                        setFile(null);
                        setErrors({});
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <FaTimesCircle />
                    </Button>
                  </div>
                </Alert>
              )}

              {errors.file && (
                <Alert variant="danger" className="mb-3">
                  {errors.file}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Document Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter descriptive document name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Brief description of the document"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category *</Form.Label>
                    <Form.Select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      isInvalid={!!errors.category}
                    >
                      <option value="general">General</option>
                      <option value="hr-policies">HR Policies</option>
                      <option value="templates">Templates</option>
                      <option value="reports">Reports</option>
                      <option value="legal">Legal Documents</option>
                      <option value="marketing">Marketing Materials</option>
                      <option value="technical">Technical Documents</option>
                      <option value="training">Training Materials</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Access Level</Form.Label>
                    <Form.Select
                      value={formData.accessLevel}
                      onChange={(e) => setFormData({...formData, accessLevel: e.target.value})}
                    >
                      <option value="private">Private (Company Only)</option>
                      <option value="public">Public (Shareable)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FaTags className="me-2" />
                  Tags
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter tags separated by commas (e.g., policy, hr, benefits)"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                />
                <Form.Text className="text-muted">
                  Tags help in searching and organizing documents
                </Form.Text>
              </Form.Group>

              {errors.submit && (
                <Alert variant="danger" className="mt-3">
                  {errors.submit}
                </Alert>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <FaTimesCircle className="me-2" />
            Are you sure you want to delete this document?
          </Alert>
          {selectedDocument && (
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                {getFileIcon(selectedDocument.fileType)}
                <strong className="ms-2">{selectedDocument.name}</strong>
              </div>
              <p className="text-muted small mb-0">
                This action cannot be undone. The document will be permanently removed.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteDocument}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Document'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Share Document Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDocument && (
            <div>
              <div className="d-flex align-items-center mb-4">
                <div className="me-3" style={{ fontSize: '2rem' }}>
                  {getFileIcon(selectedDocument.fileType)}
                </div>
                <div>
                  <h6 className="mb-1">{selectedDocument.name}</h6>
                  <small className="text-muted">
                    {getFileType(selectedDocument.fileName)} • {formatFileSize(selectedDocument.fileSize)}
                  </small>
                </div>
              </div>

              {selectedDocument.accessLevel === 'private' ? (
                <Alert variant="warning">
                  <FaLock className="me-2" />
                  This document is private. Change access level to &quot;Public&quot; to share.
                </Alert>
              ) : (
                <div>
                  <Form.Group className="mb-3">
                    <Form.Label>Share Link</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={selectedDocument.downloadURL}
                        readOnly
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => copyShareLink(selectedDocument)}
                      >
                        <FaCopy />
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Anyone with this link can access the document
                    </Form.Text>
                  </Form.Group>

                  <Alert variant="info" className="small">
                    <strong>Sharing Options:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Copy link and share via email</li>
                      <li>Embed in website (if supported)</li>
                      <li>Generate QR code for quick access</li>
                    </ul>
                  </Alert>
                </div>
              )}

              <div className="mt-4">
                <h6 className="mb-3">Quick Actions</h6>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    className="flex-grow-1"
                    onClick={() => window.open(selectedDocument.downloadURL, '_blank')}
                  >
                    <FaExternalLinkAlt className="me-2" /> Preview
                  </Button>
                  <Button 
                    variant="outline-success" 
                    className="flex-grow-1"
                    onClick={() => handleDownload(selectedDocument)}
                  >
                    <FaDownload className="me-2" /> Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowShareModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DocumentHub;