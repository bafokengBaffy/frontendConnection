/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Badge,
  InputGroup,
  FormControl,
  Dropdown,
  Pagination,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
} from 'react-bootstrap';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../config/firebase';
import {
  FaUpload,
  FaDownload,
  FaTrash,
  FaEye,
  FaEdit,
  FaFilter,
  FaSearch,
  FaSort,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFolderPlus,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Documents.css';

const Documents = () => {
  const { currentUser, userProfile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(10);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'academic',
    file: null,
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [categories] = useState([
    { value: 'academic', label: 'Academic Records', icon: '📚' },
    { value: 'certificates', label: 'Certificates', icon: '🏆' },
    { value: 'resume', label: 'Resume/CV', icon: '📄' },
    { value: 'identification', label: 'Identification', icon: '🆔' },
    { value: 'portfolio', label: 'Portfolio', icon: '💼' },
    { value: 'other', label: 'Other', icon: '📎' },
  ]);

  // Fetch documents on component mount and when filters change
  useEffect(() => {
    if (currentUser) {
      fetchDocuments();
    }
  }, [currentUser, filterCategory, filterStatus, sortField, sortOrder]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const documentsRef = collection(db, 'studentDocuments');
      let q = query(
        documentsRef,
        where('studentId', '==', currentUser.uid),
        orderBy(sortField, sortOrder)
      );

      if (filterCategory !== 'all') {
        q = query(q, where('category', '==', filterCategory));
      }

      if (filterStatus !== 'all') {
        q = query(q, where('status', '==', filterStatus));
      }

      const querySnapshot = await getDocs(q);
      const docsList = [];

      querySnapshot.forEach((doc) => {
        docsList.push({
          id: doc.id,
          ...doc.data(),
          uploadDate: doc.data().uploadDate?.toDate() || new Date(),
        });
      });

      setDocuments(docsList);
    } catch (error) {
      console.error('Error fetching the documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title.trim()) {
      toast.error('Please provide a title and select a file');
      return;
    }

    try {
      setUploading(true);
      const file = uploadForm.file;
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `student-documents/${currentUser.uid}/${fileName}`);

      // Start upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Upload failed');
          setUploading(false);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Create document record in Firestore
            const docRef = doc(collection(db, 'studentDocuments'));
            const documentData = {
              id: docRef.id,
              studentId: currentUser.uid,
              studentName: userProfile?.fullName || currentUser.displayName || 'Unknown',
              studentEmail: currentUser.email,
              title: uploadForm.title.trim(),
              description: uploadForm.description.trim(),
              category: uploadForm.category,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              fileExtension,
              downloadURL,
              storagePath: uploadTask.snapshot.ref.fullPath,
              status: 'pending',
              tags: uploadForm.tags,
              uploadDate: serverTimestamp(),
              lastUpdated: serverTimestamp(),
              verifiedBy: null,
              verifiedDate: null,
              version: 1,
            };

            await setDoc(docRef, documentData);

            // Reset form and close modal
            setUploadForm({
              title: '',
              description: '',
              category: 'academic',
              file: null,
              tags: [],
            });
            setUploadProgress(0);
            setShowUploadModal(false);

            // Refresh documents list
            await fetchDocuments();

            toast.success('Document uploaded successfully');
          } catch (error) {
            console.error('Error saving document metadata:', error);
            toast.error('Failed to save document metadata');
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      // Create temporary link for download
      const link = document.createElement('a');
      link.href = document.downloadURL;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log download activity
      await setDoc(doc(collection(db, 'documentActivities')), {
        documentId: document.id,
        studentId: currentUser.uid,
        action: 'download',
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
      });

      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, selectedDocument.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'studentDocuments', selectedDocument.id));

      // Refresh documents list
      await fetchDocuments();
      setShowDeleteModal(false);
      setSelectedDocument(null);

      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleUpdateStatus = async (documentId, newStatus) => {
    try {
      await updateDoc(doc(db, 'studentDocuments', documentId), {
        status: newStatus,
        lastUpdated: serverTimestamp(),
      });

      await fetchDocuments();
      toast.success('Document status updated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update document');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !uploadForm.tags.includes(newTag.trim())) {
      setUploadForm({
        ...uploadForm,
        tags: [...uploadForm.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setUploadForm({
      ...uploadForm,
      tags: uploadForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const getFileIcon = (fileType, extension) => {
    if (fileType.includes('pdf')) return <FaFilePdf className="text-danger" />;
    if (fileType.includes('word') || extension === 'doc' || extension === 'docx')
      return <FaFileWord className="text-primary" />;
    if (fileType.includes('excel') || extension === 'xls' || extension === 'xlsx')
      return <FaFileExcel className="text-success" />;
    if (fileType.includes('image')) return <FaFileImage className="text-warning" />;
    if (['zip', 'rar', '7z'].includes(extension))
      return <FaFileArchive className="text-secondary" />;
    return <FaFilePdf className="text-muted" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Badge bg="success">
            <FaCheckCircle /> Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge bg="warning">
            <FaClock /> Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge bg="danger">
            <FaTimesCircle /> Rejected
          </Badge>
        );
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Filter documents based on search term
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category ? `${category.icon} ${category.label}` : categoryValue;
  };

  const getStorageUsage = () => {
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
    const maxSize = 100 * 1024 * 1024; // 100MB limit
    return {
      used: totalSize,
      total: maxSize,
      percentage: (totalSize / maxSize) * 100,
    };
  };

  const storageUsage = getStorageUsage();

  if (loading && documents.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your documents...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">📄 My Documents</h2>
          <p className="text-muted">
            Manage and organize all your academic and professional documents
          </p>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
            className="d-flex align-items-center"
          >
            <FaUpload className="me-2" /> Upload Document
          </Button>
        </Col>
      </Row>

      {/* Storage Usage Bar */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Storage Usage</span>
                <span className="text-muted">
                  {formatFileSize(storageUsage.used)} / {formatFileSize(storageUsage.total)}
                </span>
              </div>
              <ProgressBar
                now={storageUsage.percentage}
                variant={
                  storageUsage.percentage > 90
                    ? 'danger'
                    : storageUsage.percentage > 70
                      ? 'warning'
                      : 'success'
                }
                className="mb-2"
              />
              <small className="text-muted">
                {storageUsage.percentage.toFixed(1)}% used •{' '}
                {formatFileSize(storageUsage.total - storageUsage.used)} remaining
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex align-items-center">
              <span className="text-muted me-2">Sort:</span>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}{' '}
                  {sortField === 'uploadDate'
                    ? 'Date'
                    : sortField === 'title'
                      ? 'Title'
                      : sortField === 'fileSize'
                        ? 'Size'
                        : 'Category'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleSort('uploadDate')}>
                    <FaSort /> Upload Date
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSort('title')}>
                    <FaSort /> Title
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSort('fileSize')}>
                    <FaSort /> File Size
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSort('category')}>
                    <FaSort /> Category
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Documents Table */}
      <Card>
        <Card.Body>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-5">
              <FaFolderPlus size={48} className="text-muted mb-3" />
              <h5>No documents found</h5>
              <p className="text-muted">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try changing your search or filters'
                  : 'Upload your first document to get started'}
              </p>
              <Button variant="outline-primary" onClick={() => setShowUploadModal(true)}>
                <FaUpload className="me-2" /> Upload Document
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Category</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Upload Date</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3 fs-4">
                              {getFileIcon(doc.fileType, doc.fileExtension)}
                            </div>
                            <div>
                              <strong className="d-block">{doc.title}</strong>
                              <small className="text-muted">
                                {doc.description || 'No description'}
                              </small>
                              {doc.tags.length > 0 && (
                                <div className="mt-1">
                                  {doc.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} bg="light" text="dark" className="me-1">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {doc.tags.length > 3 && (
                                    <Badge bg="light" text="dark">
                                      +{doc.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{getCategoryLabel(doc.category)}</td>
                        <td>{formatFileSize(doc.fileSize)}</td>
                        <td>{getStatusBadge(doc.status)}</td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{formatDate(doc.uploadDate)}</Tooltip>}
                          >
                            <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                          </OverlayTrigger>
                        </td>
                        <td className="text-end">
                          <div className="btn-group" role="group">
                            <OverlayTrigger placement="top" overlay={<Tooltip>Preview</Tooltip>}>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => window.open(doc.downloadURL, '_blank')}
                                className="me-1"
                              >
                                <FaEye />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Download</Tooltip>}>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                className="me-1"
                              >
                                <FaDownload />
                              </Button>
                            </OverlayTrigger>
                            {doc.status === 'pending' && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Mark as Verified</Tooltip>}
                              >
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(doc.id, 'verified')}
                                  className="me-1"
                                >
                                  <FaCheckCircle />
                                </Button>
                              </OverlayTrigger>
                            )}
                            <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
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
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Upload Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => !uploading && setShowUploadModal(false)}
        size="lg"
      >
        <Modal.Header closeButton disabled={uploading}>
          <Modal.Title>Upload New Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFileUpload}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="e.g., University Transcript"
                    required
                    disabled={uploading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    disabled={uploading}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Brief description of the document..."
                    disabled={uploading}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Tags</Form.Label>
                  <InputGroup className="mb-2">
                    <FormControl
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag (press Enter or click Add)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      disabled={uploading}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handleAddTag}
                      disabled={uploading || !newTag.trim()}
                    >
                      Add
                    </Button>
                  </InputGroup>
                  <div className="d-flex flex-wrap gap-2">
                    {uploadForm.tags.map((tag, index) => (
                      <Badge key={index} bg="primary" className="d-flex align-items-center">
                        {tag}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: '0.5rem' }}
                          onClick={() => handleRemoveTag(tag)}
                          disabled={uploading}
                          aria-label="Remove tag"
                        />
                      </Badge>
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Select File *</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                    required
                    disabled={uploading}
                  />
                  <Form.Text className="text-muted">
                    Supported formats: PDF, Word, Excel, Images, ZIP (Max 10MB)
                  </Form.Text>
                </Form.Group>
              </Col>
              {uploading && (
                <Col md={12}>
                  <div className="mt-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <ProgressBar now={uploadProgress} animated />
                    <div className="text-center mt-2">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Please wait while your document is being uploaded...
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={uploading || !uploadForm.file || !uploadForm.title.trim()}
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
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FaTrash className="me-2" />
            Are you sure you want to delete <strong>&quot;{selectedDocument?.title}&quot;</strong>?
          </Alert>
          <p className="text-muted">
            This action cannot be undone. The document will be permanently removed from storage.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="me-2" /> Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Documents;
