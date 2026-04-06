import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Image, Spinner, Alert, Modal, Row, Col, ProgressBar } from 'react-bootstrap';
import {
  FiUpload,
  FiCamera,
  FiTrash2,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiCopy,
  FiDownload,
  FiEdit2,
  FiMaximize2,
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { cloudinaryService } from '../../services/cloudinaryService';
import './ProfilePhotoUpload.css';

/**
 * ProfilePhotoUpload Component
 * Handles profile photo upload with preview, camera capture, and drag-and-drop
 *
 * @component
 * @param {Object} props
 * @param {string} props.userId - User ID for the profile
 * @param {string} props.currentPhoto - Current photo URL
 * @param {Function} props.onPhotoUpdate - Callback when photo is updated
 * @param {boolean} props.disabled - Disable upload functionality
 * @param {string} props.size - Size of the photo display (sm, md, lg, xl)
 * @param {boolean} props.showPreview - Show preview modal option
 * @param {boolean} props.allowDelete - Allow photo deletion
 * @param {boolean} props.allowEdit - Allow photo editing
 * @param {boolean} props.allowCamera - Allow camera capture
 * @param {number} props.maxSize - Maximum file size in MB
 * @param {boolean} props.optimizeImages - Optimize images on upload
 */
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
  maxSize = 5,
  optimizeImages = true,
}) => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotifications();

  // Refs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // State
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
    xl: { width: 200, height: 200, className: 'photo-xl' },
  };

  const config = sizeConfig[size] || sizeConfig.lg;

  // Validate if user can upload
  const canUpload = !disabled && userId && currentUser?.uid === userId;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  /**
   * Validate file type and size
   */
  const validateFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please select a valid image (JPEG, PNG, WebP, or GIF)');
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`Image must be smaller than ${maxSize}MB`);
    }

    return true;
  };

  /**
   * Create image preview and get dimensions
   */
  const createPreview = (file) => {
    return new Promise((resolve, reject) => {
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

          resolve(previewUrl);
        };

        img.onerror = reject;
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await validateAndPreviewFile(file, 'file');
    }
    event.target.value = '';
  };

  /**
   * Handle camera capture
   */
  const handleCameraCapture = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await validateAndPreviewFile(file, 'camera');
    }
    event.target.value = '';
  };

  /**
   * Validate and preview file
   */
  const validateAndPreviewFile = async (file, method) => {
    try {
      setError(null);
      setSuccess(null);
      setUploadMethod(method);

      // Validate file
      validateFile(file);

      // Create preview
      const previewUrl = await createPreview(file);

      setPreviewImage(previewUrl);
      setSelectedFile(file);
    } catch (err) {
      setError(err.message);
      showNotification({
        type: 'error',
        title: 'Invalid File',
        message: err.message,
        duration: 5000,
      });
    }
  };

  /**
   * Handle drag and drop
   */
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

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!canUpload) {
      showNotification({
        type: 'warning',
        title: 'Permission Denied',
        message: 'You do not have permission to upload photos',
        duration: 3000,
      });
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await validateAndPreviewFile(file, 'drag-drop');
    }
  };

  /**
   * Handle upload to Cloudinary
   */
  const handleUpload = async () => {
    if (!selectedFile || !canUpload) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress (real progress from Cloudinary)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Cloudinary
      const result = await cloudinaryService.uploadImage(selectedFile, {
        folder: `profiles/${userId}`,
        transformation: optimizeImages
          ? {
              width: 400,
              height: 400,
              crop: 'fill',
              quality: 'auto',
              fetch_format: 'auto',
            }
          : undefined,
        onProgress: (progress) => {
          setUploadProgress(Math.round(progress));
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result?.url) {
        // Calculate stats
        const stats = {
          originalSize: selectedFile.size,
          optimizedSize: result.bytes || selectedFile.size,
          storageType: 'cloudinary',
          uploadTime: new Date().toISOString(),
          dimensions: imageDimensions,
          publicId: result.publicId,
          format: result.format,
        };

        setUploadStats(stats);

        // Update parent component
        if (onPhotoUpdate) {
          onPhotoUpdate(result.url, stats);
        }

        // Show success notification
        setSuccess('Profile photo uploaded successfully!');
        showNotification({
          type: 'success',
          title: 'Photo Updated',
          message: 'Your profile photo has been updated',
          duration: 3000,
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
        throw new Error('Upload failed - no URL returned');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo');
      showNotification({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Failed to upload profile photo',
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle delete photo
   */
  const handleDelete = async () => {
    try {
      setUploading(true);
      setError(null);

      // Extract public ID from current photo URL if it's from Cloudinary
      let publicId = null;
      if (currentPhoto?.includes('cloudinary')) {
        const matches = currentPhoto.match(/.v.+.(.+?)./);
        publicId = matches ? matches[1] : null;
      }

      // Delete from Cloudinary if we have public ID
      if (publicId) {
        await cloudinaryService.deleteImage(publicId);
      }

      // Update parent component
      if (onPhotoUpdate) {
        onPhotoUpdate(null, { deleted: true });
      }

      setSuccess('Profile photo deleted successfully');
      showNotification({
        type: 'success',
        title: 'Photo Deleted',
        message: 'Profile photo has been removed',
        duration: 3000,
      });

      setShowDeleteModal(false);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete photo');
      showNotification({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete profile photo',
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle cancel preview
   */
  const handleCancelPreview = () => {
    if (previewImage?.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setSelectedFile(null);
    setError(null);
    setUploadMethod(null);
    setImageDimensions({ width: 0, height: 0 });
  };

  /**
   * Copy photo URL to clipboard
   */
  const copyPhotoUrl = () => {
    if (currentPhoto) {
      navigator.clipboard.writeText(currentPhoto).then(
        () => {
          showNotification({
            type: 'success',
            title: 'Copied',
            message: 'Photo URL copied to clipboard',
            duration: 2000,
          });
        },
        () => {
          showNotification({
            type: 'error',
            title: 'Copy Failed',
            message: 'Could not copy URL',
            duration: 2000,
          });
        }
      );
    }
  };

  /**
   * Download photo
   */
  const downloadPhoto = async () => {
    if (currentPhoto) {
      try {
        const response = await fetch(currentPhoto);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `profile-${userId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download error:', err);
        showNotification({
          type: 'error',
          title: 'Download Failed',
          message: 'Could not download photo',
          duration: 2000,
        });
      }
    }
  };

  /**
   * Render photo or placeholder
   */
  const renderPhoto = () => {
    if (currentPhoto) {
      return (
        <div className="profile-photo-container">
          <Image
            src={currentPhoto}
            alt="Profile"
            className={`profile-photo ${config.className} ${canUpload && allowEdit ? 'editable' : ''}`}
            roundedCircle
            fluid
            onError={(e) => {
              console.error('Failed to load profile photo:', currentPhoto);
              e.target.src = '';
              e.target.alt = 'Failed to load';
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
                disabled={uploading}
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
                  disabled={uploading}
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

  /**
   * Render file preview
   */
  const renderPreview = () => {
    if (!previewImage) return null;

    return (
      <Card className="mt-3 border-primary">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <span>Preview New Photo</span>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
            disabled={uploading}
          >
            <FiMaximize2 />
          </Button>
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
                {(selectedFile?.size / 1024).toFixed(1)} KB
                <br />
                <small className="text-capitalize">via {uploadMethod?.replace('-', ' ')}</small>
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
                    animated={uploadProgress < 100}
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

  /**
   * Render upload stats
   */
  const renderStats = () => {
    if (!uploadStats) return null;

    const savings = uploadStats.optimizedSize
      ? ((1 - uploadStats.optimizedSize / uploadStats.originalSize) * 100).toFixed(1)
      : 0;

    return (
      <Card className="mt-3 border-success">
        <Card.Header className="bg-success text-white">
          <FiCheckCircle className="me-2" />
          Upload Successful
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="small mb-1">
                <strong>Storage:</strong> {uploadStats.storageType}
              </div>
              <div className="small mb-1">
                <strong>Format:</strong> {uploadStats.format?.toUpperCase()}
              </div>
              <div className="small mb-1">
                <strong>Dimensions:</strong> {uploadStats.dimensions.width} ×{' '}
                {uploadStats.dimensions.height}
              </div>
            </Col>
            <Col md={6}>
              <div className="small mb-1">
                <strong>Original Size:</strong> {(uploadStats.originalSize / 1024).toFixed(1)} KB
              </div>
              {uploadStats.optimizedSize && (
                <div className="small mb-1">
                  <strong>Optimized Size:</strong> {(uploadStats.optimizedSize / 1024).toFixed(1)}{' '}
                  KB
                  <span className="text-success ms-2">(-{savings}%)</span>
                </div>
              )}
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
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        disabled={!canUpload || uploading}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleCameraCapture}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        disabled={!canUpload || uploading}
      />

      {/* Main Photo Display */}
      <div className="text-center mb-3">
        {renderPhoto()}

        {!currentPhoto && canUpload && (
          <div className="mt-3">
            <p className="text-muted small mb-2">Add a profile photo to complete your profile</p>
          </div>
        )}

        {currentPhoto && canUpload && !previewImage && (
          <div className="mt-3 d-flex flex-wrap justify-content-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <FiUpload className="me-1" />
              Change Photo
            </Button>
            {allowCamera && (
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
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
                disabled={uploading}
              >
                <FiTrash2 className="me-1" />
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Zone (when adding new photo) */}
      {!previewImage && canUpload && !currentPhoto && (
        <div
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          <div className="upload-zone-content">
            <FiUpload size={48} className="text-muted mb-3" />
            <h6>Upload Profile Photo</h6>
            <p className="text-muted small">Drag & drop an image here, or click to browse</p>
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
                disabled={uploading}
              >
                <FiCamera className="me-2" />
                Take Photo with Camera
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Preview Section */}
      {previewImage && renderPreview()}

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
      {uploadStats && renderStats()}

      {/* Current Photo Actions (when photo exists and preview not active) */}
      {currentPhoto && showPreview && !previewImage && (
        <Card className="mt-3">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Photo Details</h6>
          </Card.Header>
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="flex-grow-1 me-3">
                <small className="text-muted d-block mb-1">Current Photo URL:</small>
                <div className="truncate-url small bg-light p-2 rounded">
                  <a
                    href={currentPhoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    {currentPhoto.length > 50
                      ? `${currentPhoto.substring(0, 50)}...`
                      : currentPhoto}
                  </a>
                </div>
              </div>
              <div className="d-flex gap-1 flex-shrink-0">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={copyPhotoUrl}
                  title="Copy URL"
                  disabled={uploading}
                >
                  <FiCopy />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={downloadPhoto}
                  title="Download"
                  disabled={uploading}
                >
                  <FiDownload />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowPreviewModal(true)}
                  title="View Full Size"
                  disabled={uploading}
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
          <p className="mb-3">Are you sure you want to remove your profile photo?</p>
          {currentPhoto && (
            <div className="text-center mb-3">
              <Image
                src={currentPhoto}
                alt="Current Profile"
                className="modal-preview-image"
                style={{ maxWidth: '150px', maxHeight: '150px' }}
                roundedCircle
                fluid
              />
            </div>
          )}
          <Alert variant="warning" className="small mb-0">
            <FiXCircle className="me-2" />
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
          <Button variant="danger" onClick={handleDelete} disabled={uploading}>
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
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Profile Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image
            src={previewImage || currentPhoto}
            alt="Full Size Preview"
            className="full-preview-image"
            style={{ maxHeight: '70vh', maxWidth: '100%' }}
            fluid
            rounded
          />
          <div className="mt-3 small text-muted">
            {imageDimensions.width && imageDimensions.height ? (
              <>
                Dimensions: {imageDimensions.width} × {imageDimensions.height}px
                {previewImage && selectedFile && <> • {(selectedFile.size / 1024).toFixed(1)} KB</>}
              </>
            ) : (
              <>{currentPhoto ? 'Current profile photo' : 'New photo preview'}</>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          {currentPhoto && !previewImage && (
            <>
              <Button variant="outline-primary" onClick={copyPhotoUrl}>
                <FiCopy className="me-2" />
                Copy URL
              </Button>
              <Button variant="outline-success" onClick={downloadPhoto}>
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

ProfilePhotoUpload.propTypes = {
  userId: PropTypes.string.isRequired,
  currentPhoto: PropTypes.string,
  onPhotoUpdate: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showPreview: PropTypes.bool,
  allowDelete: PropTypes.bool,
  allowEdit: PropTypes.bool,
  allowCamera: PropTypes.bool,
  maxSize: PropTypes.number,
  optimizeImages: PropTypes.bool,
};

export default ProfilePhotoUpload;
