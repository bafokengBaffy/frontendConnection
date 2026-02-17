/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Image,
  Spinner,
  Alert,
  Modal,
  Row,
  Col,
  ProgressBar,
  Badge
} from 'react-bootstrap';
import {
  FiUpload,
  FiCamera,
  FiTrash2,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiEye,
  FiLink,
  FiCopy,
  FiShare2,
  FiEdit2,
  FiMaximize2,
  FiDownload
} from 'react-icons/fi';
import { TbPhotoEdit } from 'react-icons/tb';
import { RiImageEditLine } from 'react-icons/ri';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import './ProfilePhotoUpload.css';

const ProfilePhotoUpload = ({ 
  userId, 
  currentPhoto, 
  onPhotoUpdate,
  disabled = false,
  size = 'lg',
  showPreview = true,
  allowDelete = true,
  allowEdit = true,
  allowCamera = true,
  maxSize = 5, // MB
  optimizeImages = true
}) => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotifications();
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const previewCanvasRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: { width: 80, height: 80, className: 'photo-sm' },
    md: { width: 120, height: 120, className: 'photo-md' },
    lg: { width: 160, height: 160, className: 'photo-lg' },
    xl: { width: 200, height: 200, className: 'photo-xl' }
  };

  const config = sizeConfig[size] || sizeConfig.lg;

  // Validate if user can upload
  const canUpload = !disabled && userId && currentUser?.uid === userId;

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndPreviewFile(file, 'file');
    }
    event.target.value = '';
  };

  // Handle camera capture
  const handleCameraCapture = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndPreviewFile(file, 'camera');
    }
    event.target.value = '';
  };

  // Validate and preview file
  const validateAndPreviewFile = (file, method) => {
    setError(null);
    setSuccess(null);
    setUploadMethod(method);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Image must be smaller than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        
        // Resize for preview if too large
        let previewUrl = e.target.result;
        if (img.width > 800 || img.height > 800) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const ratio = Math.min(800 / img.width, 800 / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          previewUrl = canvas.toDataURL(file.type, 0.8);
        }
        
        setPreviewImage(previewUrl);
        setSelectedFile(file);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canUpload) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!canUpload) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndPreviewFile(file, 'drag-drop');
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !canUpload) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress (real progress would come from service)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Call profile service
      const result = await profileService.uploadProfilePhoto(userId, selectedFile, {
        optimize: optimizeImages,
        maxSize: maxSize * 1024 * 1024,
        useCloudinary: true,
        fallbackToFirebase: true
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadStats({
          originalSize: selectedFile.size,
          optimizedSize: result.metadata?.fileSize,
          storageType: result.storageType,
          uploadTime: new Date().toISOString(),
          dimensions: imageDimensions
        });

        // Update parent component
        if (onPhotoUpdate) {
          onPhotoUpdate(result.url, result);
        }

        // Show success
        setSuccess('Profile photo uploaded successfully!');
        showNotification({
          type: 'success',
          title: 'Photo Updated',
          message: 'Your profile photo has been updated',
          duration: 3000
        });

        // Reset state after delay
        setTimeout(() => {
          setPreviewImage(null);
          setSelectedFile(null);
          setUploadProgress(0);
          setUploadMethod(null);
          setUploadStats(null);
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload photo');
      showNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload profile photo',
        duration: 5000
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setUploading(true);
      setError(null);

      // Get public ID from current photo URL or profile data
      const publicId = currentPhoto?.includes('cloudinary') 
        ? currentPhoto.split('/').slice(-2).join('/').split('.')[0]
        : null;

      const result = await profileService.deleteProfilePhoto(userId, publicId);

      if (result.success) {
        // Update parent component
        if (onPhotoUpdate) {
          onPhotoUpdate('');
        }

        setSuccess('Profile photo deleted successfully');
        showNotification({
          type: 'success',
          title: 'Photo Deleted',
          message: 'Profile photo has been removed',
          duration: 3000
        });

        setShowDeleteModal(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message || 'Failed to delete photo');
    } finally {
      setUploading(false);
    }
  };

  // Handle cancel preview
  const handleCancelPreview = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setError(null);
    setUploadMethod(null);
  };

  // Copy photo URL to clipboard
  const copyPhotoUrl = () => {
    if (currentPhoto) {
      navigator.clipboard.writeText(currentPhoto)
        .then(() => {
          showNotification({
            type: 'success',
            title: 'Copied',
            message: 'Photo URL copied to clipboard',
            duration: 2000
          });
        })
        .catch(() => {
          showNotification({
            type: 'error',
            title: 'Copy Failed',
            message: 'Could not copy URL',
            duration: 2000
          });
        });
    }
  };

  // Download photo
  const downloadPhoto = () => {
    if (currentPhoto) {
      const link = document.createElement('a');
      link.href = currentPhoto;
      link.download = `profile-photo-${userId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Render photo or placeholder
  const renderPhoto = () => {
    if (currentPhoto) {
      return (
        <div className="profile-photo-container">
          <Image
            src={currentPhoto}
            alt="Profile"
            className={`profile-photo ${config.className} ${canUpload ? 'editable' : ''}`}
            roundedCircle
            fluid
            onError={(e) => {
              console.error('Failed to load profile photo:', currentPhoto);
              e.target.src = '';
              e.target.style.display = 'none';
            }}
          />
          {canUpload && allowEdit && (
            <div className="photo-overlay">
              <Button
                variant="light"
                size="sm"
                className="overlay-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
              >
                <FiEdit2 />
              </Button>
              {allowDelete && (
                <Button
                  variant="light"
                  size="sm"
                  className="overlay-btn"
                  onClick={() => setShowDeleteModal(true)}
                  title="Delete Photo"
                >
                  <FiTrash2 />
                </Button>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="profile-photo-placeholder">
        <div className={`placeholder-content ${config.className}`}>
          <FiUser size={config.width / 2} />
          {canUpload && (
            <div className="placeholder-overlay">
              <span>Add Photo</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render file preview
  const renderPreview = () => {
    if (!previewImage) return null;

    return (
      <Card className="mt-3 border-primary">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <span>Preview New Photo</span>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
            >
              <FiMaximize2 />
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="text-center">
              <Image
                src={previewImage}
                alt="Preview"
                className="preview-image mb-3"
                roundedCircle
                fluid
              />
              <div className="small text-muted">
                {imageDimensions.width} × {imageDimensions.height}px
                <br />
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </Col>
            <Col md={6}>
              <div className="upload-actions">
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-100 mb-2"
                >
                  {uploading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload className="me-2" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleCancelPreview}
                  disabled={uploading}
                  className="w-100"
                >
                  <FiXCircle className="me-2" />
                  Cancel
                </Button>
              </div>
              {uploading && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <ProgressBar 
                    now={uploadProgress} 
                    animated 
                    variant="primary"
                  />
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  // Render upload stats
  const renderStats = () => {
    if (!uploadStats) return null;

    return (
      <Card className="mt-3 border-success">
        <Card.Header className="bg-success text-white">
          <FiCheckCircle className="me-2" />
          Upload Successful
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="small">
                <strong>Storage:</strong> {uploadStats.storageType}
              </div>
              <div className="small">
                <strong>Original Size:</strong> {(uploadStats.originalSize / 1024).toFixed(1)} KB
              </div>
              {uploadStats.optimizedSize && (
                <div className="small">
                  <strong>Optimized Size:</strong> {(uploadStats.optimizedSize / 1024).toFixed(1)} KB
                </div>
              )}
            </Col>
            <Col md={6}>
              <div className="small">
                <strong>Dimensions:</strong> {uploadStats.dimensions.width} × {uploadStats.dimensions.height}
              </div>
              <div className="small">
                <strong>Time:</strong> {new Date(uploadStats.uploadTime).toLocaleTimeString()}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="profile-photo-upload">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleCameraCapture}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* Main Photo Display */}
      <div className="text-center mb-3">
        {renderPhoto()}
        
        {!currentPhoto && canUpload && (
          <div className="mt-3">
            <p className="text-muted small mb-2">
              Add a profile photo to complete your profile
            </p>
          </div>
        )}

        {currentPhoto && canUpload && (
          <div className="mt-3 d-flex flex-wrap justify-content-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload className="me-1" />
              Change Photo
            </Button>
            {allowCamera && (
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
              >
                <FiCamera className="me-1" />
                Take Photo
              </Button>
            )}
            {allowDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <FiTrash2 className="me-1" />
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Zone (when no photo or when adding) */}
      {(!currentPhoto || previewImage) && canUpload && (
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !previewImage && fileInputRef.current?.click()}
        >
          {previewImage ? (
            renderPreview()
          ) : (
            <div className="upload-zone-content">
              <FiUpload size={48} className="text-muted mb-3" />
              <h6>Upload Profile Photo</h6>
              <p className="text-muted small">
                Drag & drop an image here, or click to browse
              </p>
              <p className="text-muted small mb-0">
                Supported: JPG, PNG, WebP, GIF • Max: {maxSize}MB
              </p>
              {allowCamera && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                >
                  <FiCamera className="me-2" />
                  Take Photo with Camera
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
          <FiXCircle className="me-2" />
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-3" dismissible onClose={() => setSuccess(null)}>
          <FiCheckCircle className="me-2" />
          {success}
        </Alert>
      )}

      {/* Upload Stats */}
      {renderStats()}

      {/* Current Photo Actions (when photo exists) */}
      {currentPhoto && showPreview && (
        <Card className="mt-3">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Photo Details</h6>
          </Card.Header>
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Current Photo URL:</small>
                <div className="truncate-url small">
                  <a href={currentPhoto} target="_blank" rel="noopener noreferrer">
                    {currentPhoto.substring(0, 50)}...
                  </a>
                </div>
              </div>
              <div className="d-flex gap-1">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={copyPhotoUrl}
                  title="Copy URL"
                >
                  <FiCopy />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={downloadPhoto}
                  title="Download"
                >
                  <FiDownload />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowPreviewModal(true)}
                  title="View Full Size"
                >
                  <FiEye />
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Remove Profile Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove your profile photo?</p>
          <div className="text-center">
            <Image
              src={currentPhoto}
              alt="Current Profile"
              className="modal-preview-image mb-3"
              roundedCircle
              fluid
            />
          </div>
          <Alert variant="warning" className="small">
      
            This action cannot be undone. Your profile will show the default placeholder.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Removing...
              </>
            ) : (
              <>
                <FiTrash2 className="me-2" />
                Remove Photo
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview Modal */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Profile Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image
            src={previewImage || currentPhoto}
            alt="Full Size Preview"
            className="full-preview-image"
            fluid
            rounded
          />
          <div className="mt-3 small text-muted">
            {imageDimensions.width && imageDimensions.height ? (
              <>
                Dimensions: {imageDimensions.width} × {imageDimensions.height}px
              </>
            ) : (
              <>
                {currentPhoto ? 'Current profile photo' : 'New photo preview'}
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPreviewModal(false)}
          >
            Close
          </Button>
          {currentPhoto && (
            <>
              <Button
                variant="outline-primary"
                onClick={copyPhotoUrl}
              >
                <FiCopy className="me-2" />
                Copy URL
              </Button>
              <Button
                variant="outline-success"
                onClick={downloadPhoto}
              >
                <FiDownload className="me-2" />
                Download
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfilePhotoUpload;