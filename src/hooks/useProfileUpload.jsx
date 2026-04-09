// src/hooks/useProfileUpload.js
import { useState, useCallback, useEffect, useRef } from 'react';

import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';

/**
 * Production-Ready Profile Upload Hook with Error Recovery & Mobile Optimization
 */

export const useProfileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default for images
    allowedTypes = [],
    onUploadStart = () => {},
    onUploadProgress = () => {},
    onUploadComplete = () => {},
    onUploadError = () => {},
    enableFallback = true,
    autoRetry = true,
    maxRetries = 2,
  } = options;

  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const uploadController = useRef(null);
  const progressInterval = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (uploadController.current) {
        uploadController.current.abort();
      }
    };
  }, []);

  const resetUpload = useCallback(() => {
    setUploading(false);
    setCurrentFile(null);
    setProgress(0);
    setUploadError(null);
    setUploadResult(null);
    setRetryCount(0);

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (uploadController.current) {
      uploadController.current.abort();
      uploadController.current = null;
    }
  }, []);

  const simulateProgress = useCallback(
    (duration = 2000, steps = 10) => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      const step = 100 / steps;
      const interval = duration / steps;
      let current = 0;

      progressInterval.current = setInterval(() => {
        current += step;
        if (current >= 90) {
          clearInterval(progressInterval.current);
          setProgress(90); // Hold at 90% until actual upload completes
          onUploadProgress(90);
        } else {
          const nextProgress = Math.min(current, 90);
          setProgress(nextProgress);
          onUploadProgress(nextProgress);
        }
      }, interval);
    },
    [onUploadProgress]
  );

  // Enhanced file validation with detailed error messages
  const validateFile = useCallback(
    (file, fileType = 'image') => {
      setUploadError(null);

      // Size validation
      if (file.size > maxSize) {
        const error = {
          message: `File size exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit`,
          type: 'SIZE_LIMIT_EXCEEDED',
          maxSize,
          actualSize: file.size,
        };
        setUploadError(error);
        onUploadError(error);
        return { valid: false, error };
      }

      // Type validation
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        const error = {
          message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          type: 'INVALID_FILE_TYPE',
          allowedTypes,
          actualType: file.type,
        };
        setUploadError(error);
        onUploadError(error);
        return { valid: false, error };
      }

      // Type-specific validation
      if (fileType === 'image') {
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!imageTypes.includes(file.type)) {
          const error = {
            message: 'Please upload an image file (JPEG, PNG, WebP, or GIF)',
            type: 'INVALID_IMAGE_TYPE',
            allowedTypes: imageTypes,
          };
          setUploadError(error);
          onUploadError(error);
          return { valid: false, error };
        }

        // Check image dimensions (async)
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (img.width > 5000 || img.height > 5000) {
              const error = {
                message: 'Image dimensions too large. Maximum 5000x5000 pixels',
                type: 'IMAGE_TOO_LARGE',
                maxDimensions: { width: 5000, height: 5000 },
                actualDimensions: { width: img.width, height: img.height },
              };
              setUploadError(error);
              onUploadError(error);
              resolve({ valid: false, error });
            } else {
              resolve({ valid: true, dimensions: { width: img.width, height: img.height } });
            }
          };
          img.onerror = () => {
            const error = {
              message: 'Invalid image file or corrupted image',
              type: 'INVALID_IMAGE_FILE',
            };
            setUploadError(error);
            onUploadError(error);
            resolve({ valid: false, error });
          };
          img.src = URL.createObjectURL(file);
        });
      }

      if (fileType === 'resume') {
        const docTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        if (!docTypes.includes(file.type)) {
          const error = {
            message: 'Please upload a PDF or Word document',
            type: 'INVALID_DOCUMENT_TYPE',
            allowedTypes: docTypes,
          };
          setUploadError(error);
          onUploadError(error);
          return { valid: false, error };
        }
      }

      return { valid: true };
    },
    [maxSize, allowedTypes, onUploadError]
  );

  // Upload profile photo with retry logic
  const uploadProfilePhoto = useCallback(
    async (file, retryAttempt = 0) => {
      if (!currentUser?.uid) {
        const error = { message: 'User not authenticated', type: 'AUTH_REQUIRED' };
        setUploadError(error);
        onUploadError(error);
        throw new Error('User not authenticated');
      }

      // Validate file
      const validation = await validateFile(file, 'image');
      if (!validation.valid) {
        throw new Error(validation.error?.message || 'File validation failed');
      }

      setUploading(true);
      setCurrentFile(file);
      setProgress(0);
      setUploadError(null);
      setRetryCount(retryAttempt);

      onUploadStart(file);

      // Start progress simulation
      simulateProgress();

      try {
        uploadController.current = new AbortController();

        const result = await profileService.uploadProfilePhoto(currentUser.uid, file, {
          maxSize,
          optimize: true,
          useCloudinary: true,
          fallbackToFirebase: enableFallback,
        });

        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        setProgress(100);

        if (result.success) {
          setUploadResult(result);
          onUploadComplete(result);

          // Reset after successful upload
          setTimeout(() => {
            resetUpload();
          }, 1500);

          return result;
        } else {
          // Handle retry logic
          if (autoRetry && retryAttempt < maxRetries) {
            console.warn(`Retrying upload (${retryAttempt + 1}/${maxRetries})...`);
            setTimeout(
              () => {
                uploadProfilePhoto(file, retryAttempt + 1);
              },
              1000 * (retryAttempt + 1)
            );
            return;
          }

          throw new Error(result.error || result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('❌ Profile photo upload error:', error);

        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }

        const errorDetails = {
          message: error.message,
          type: 'UPLOAD_FAILED',
          retryAttempt,
          maxRetries,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
        };

        setUploadError(errorDetails);
        onUploadError(errorDetails);
        setUploading(false);

        // Auto-retry logic
        if (autoRetry && retryAttempt < maxRetries) {
          console.warn(`Auto-retrying upload (${retryAttempt + 1}/${maxRetries})...`);
          setTimeout(
            () => {
              uploadProfilePhoto(file, retryAttempt + 1);
            },
            1000 * (retryAttempt + 1)
          );
        } else {
          setCurrentFile(null);
        }

        throw error;
      }
    },
    [
      currentUser?.uid,
      validateFile,
      onUploadStart,
      onUploadComplete,
      onUploadError,
      maxSize,
      enableFallback,
      autoRetry,
      maxRetries,
      simulateProgress,
      resetUpload,
    ]
  );

  // Upload resume
  const uploadResume = useCallback(
    async (file) => {
      if (!currentUser?.uid) {
        throw new Error('User not authenticated');
      }

      const validation = validateFile(file, 'resume');
      if (!validation.valid) {
        throw new Error(validation.error?.message || 'File validation failed');
      }

      setUploading(true);
      setCurrentFile(file);
      setProgress(0);
      setUploadError(null);

      onUploadStart(file);

      simulateProgress(3000, 15); // Longer simulation for larger files

      try {
        const result = await profileService.uploadResume(currentUser.uid, file);

        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        setProgress(100);

        if (result.success) {
          setUploadResult(result);
          onUploadComplete(result);

          setTimeout(() => {
            resetUpload();
          }, 1500);

          return result;
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('❌ Resume upload error:', error);

        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }

        const errorDetails = {
          message: error.message,
          type: 'RESUME_UPLOAD_FAILED',
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
        };

        setUploadError(errorDetails);
        onUploadError(errorDetails);
        setUploading(false);
        setCurrentFile(null);

        throw error;
      }
    },
    [
      currentUser?.uid,
      validateFile,
      onUploadStart,
      onUploadComplete,
      onUploadError,
      simulateProgress,
      resetUpload,
    ]
  );

  // Upload any document
  const uploadDocument = useCallback(
    async (file, documentType, metadata = {}) => {
      if (!currentUser?.uid) {
        throw new Error('User not authenticated');
      }

      const validation = validateFile(file, 'document');
      if (!validation.valid) {
        throw new Error(validation.error?.message || 'File validation failed');
      }

      setUploading(true);
      setCurrentFile(file);
      setProgress(0);
      setUploadError(null);

      onUploadStart(file);

      simulateProgress();

      try {
        const result = await profileService.uploadDocument(
          currentUser.uid,
          file,
          documentType,
          metadata
        );

        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
        setProgress(100);

        if (result.success) {
          setUploadResult(result);
          onUploadComplete(result);

          setTimeout(() => {
            resetUpload();
          }, 1500);

          return result;
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('❌ Document upload error:', error);

        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }

        setUploadError({
          message: error.message,
          type: 'DOCUMENT_UPLOAD_FAILED',
          documentType,
          metadata,
        });
        onUploadError(error);
        setUploading(false);
        setCurrentFile(null);

        throw error;
      }
    },
    [
      currentUser?.uid,
      validateFile,
      onUploadStart,
      onUploadComplete,
      onUploadError,
      simulateProgress,
      resetUpload,
    ]
  );

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (uploadController.current) {
      uploadController.current.abort();
    }
    resetUpload();
    onUploadError({ message: 'Upload cancelled by user', type: 'USER_CANCELLED' });
  }, [resetUpload, onUploadError]);

  // Get file preview URL
  const getFilePreview = useCallback((file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, []);

  // Revoke preview URL to prevent memory leaks
  const revokePreview = useCallback((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, []);

  return {
    // State
    uploading,
    progress,
    currentFile,
    uploadError,
    uploadResult,
    retryCount,

    // Actions
    uploadProfilePhoto,
    uploadResume,
    uploadDocument,
    cancelUpload,
    resetUpload,
    validateFile,
    getFilePreview,
    revokePreview,

    // Status helpers
    isUploading: uploading,
    hasError: !!uploadError,
    isComplete: !!uploadResult && !uploading,
    canRetry: !!uploadError && retryCount < maxRetries,

    // Configuration
    maxSize,
    allowedTypes,
    maxRetries,
    autoRetry,
  };
};

/**
 * Hook for drag and drop file upload with mobile touch support
 */
export const useDragDropUpload = (onFilesDrop, options = {}) => {
  const {
    accept = 'image/*,.pdf,.doc,.docx,.txt',
    maxFiles = 1,
    disabled = false,
    maxSize = 10 * 1024 * 1024,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState(null);
  const [touched, setTouched] = useState(false);

  const dragCounter = useRef(0);

  const handleDragEnter = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      dragCounter.current++;
      setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
      setDragError(null);
    }
  }, []);

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!disabled) {
        e.dataTransfer.dropEffect = 'copy';
      }
    },
    [disabled]
  );

  const validateDroppedFiles = useCallback(
    (files) => {
      // Check file count
      if (files.length > maxFiles) {
        return {
          valid: false,
          error: `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`,
        };
      }

      // Check file types
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const invalidFiles = [];

      files.forEach((file) => {
        let isValid = false;

        acceptedTypes.forEach((type) => {
          if (type.includes('/*')) {
            // Wildcard match (e.g., image/*)
            const category = type.split('/')[0];
            if (file.type.startsWith(category)) {
              isValid = true;
            }
          } else if (type.startsWith('.')) {
            // Extension match (e.g., .pdf)
            const extension = type.toLowerCase();
            if (file.name.toLowerCase().endsWith(extension)) {
              isValid = true;
            }
          } else {
            // MIME type match
            if (file.type === type) {
              isValid = true;
            }
          }
        });

        if (!isValid) {
          invalidFiles.push(file.name);
        }

        // Check file size
        if (file.size > maxSize) {
          invalidFiles.push(`${file.name} (too large)`);
        }
      });

      if (invalidFiles.length > 0) {
        return {
          valid: false,
          error: `Invalid files: ${invalidFiles.join(', ')}`,
        };
      }

      return { valid: true, files };
    },
    [accept, maxFiles, maxSize]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter.current = 0;
      setIsDragging(false);
      setDragError(null);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);

      const validation = validateDroppedFiles(files);
      if (!validation.valid) {
        setDragError(validation.error);
        return;
      }

      onFilesDrop(files);
    },
    [disabled, validateDroppedFiles, onFilesDrop]
  );

  // Mobile touch handlers
  const handleTouchStart = useCallback(() => {
    if (!disabled) {
      setTouched(true);
    }
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    setTouched(false);
  }, []);

  // Setup drag and drop listeners
  const setupDragDrop = useCallback(
    (element) => {
      if (!element || disabled) return;

      element.addEventListener('dragenter', handleDragEnter);
      element.addEventListener('dragleave', handleDragLeave);
      element.addEventListener('dragover', handleDragOver);
      element.addEventListener('drop', handleDrop);

      // Mobile touch events
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('dragenter', handleDragEnter);
        element.removeEventListener('dragleave', handleDragLeave);
        element.removeEventListener('dragover', handleDragOver);
        element.removeEventListener('drop', handleDrop);

        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    },
    [
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleTouchStart,
      handleTouchEnd,
      disabled,
    ]
  );

  return {
    isDragging,
    dragError,
    touched,
    setDragError,
    setupDragDrop,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  };
};
