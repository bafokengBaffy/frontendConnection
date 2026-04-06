/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  alpha,
  styled,
  useTheme,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as SheetIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';

import Button from './Button';

const DropZone = styled(Paper)(({ theme, isDragActive, error }) => ({
  border: `2px dashed ${
    error
      ? theme.palette.error.main
      : isDragActive
        ? theme.palette.primary.main
        : theme.palette.divider
  }`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: theme.transitions.create(['border-color', 'background-color']),
  backgroundColor: isDragActive
    ? alpha(theme.palette.primary.main, 0.04)
    : theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  position: 'relative',
  '&:hover .file-actions': {
    opacity: 1,
  },
}));

const FileActions = styled(Box)({
  position: 'absolute',
  top: 4,
  right: 4,
  opacity: 0,
  transition: 'opacity 0.2s',
  display: 'flex',
  gap: 4,
});

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon color="primary" />;
  }
  if (fileType === 'application/pdf') {
    return <PdfIcon color="error" />;
  }
  if (fileType.includes('document') || fileType.includes('msword')) {
    return <DocIcon color="primary" />;
  }
  if (fileType.includes('sheet') || fileType.includes('excel')) {
    return <SheetIcon color="success" />;
  }
  return <FileIcon color="action" />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUpload = ({
  // Core props
  onFilesSelected,
  onFileUpload,
  onFileRemove,
  onFileRetry,

  // Configuration
  multiple = false,
  accept,
  maxSize, // in bytes
  maxFiles,
  minFiles,

  // State
  files = [],
  uploading = false,
  uploadProgress = {},
  errors = {},

  // Features
  showPreview = true,
  showList = true,
  dropzone = true,
  dragAndDrop = true,

  // Validation
  validateFile,

  // UI
  label = 'Upload Files',
  helperText,
  error,
  required = false,
  disabled = false,

  // Customization
  dropzoneText = 'Drag and drop files here or click to browse',
  browseText = 'Browse Files',
  maxSizeText = 'Maximum file size:',
  acceptedFilesText = 'Accepted file types:',

  // Callbacks
  onValidationError,
  onDrop,
  onDragOver,
  onDragLeave,

  ...props
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [internalErrors, setInternalErrors] = useState({});

  const validateFileSize = (file) => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }
    return null;
  };

  const validateFileType = (file) => {
    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()}`;

      const isValid = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return type === fileExtension;
        }
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(category);
        }
        return type === fileType;
      });

      if (!isValid) {
        return `File type not accepted. Accepted types: ${accept}`;
      }
    }
    return null;
  };

  const validateFiles = useCallback(
    (fileList) => {
      const fileArray = Array.from(fileList);
      const newErrors = {};
      const validFiles = [];

      // Check max files
      if (maxFiles && fileArray.length + files.length > maxFiles) {
        const error = `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`;
        setInternalErrors({ maxFiles: error });
        onValidationError?.({ maxFiles: error });
        return [];
      }

      fileArray.forEach((file, index) => {
        const sizeError = validateFileSize(file);
        const typeError = validateFileType(file);
        const customError = validateFile?.(file);

        if (sizeError || typeError || customError) {
          newErrors[`${file.name}-${index}`] = sizeError || typeError || customError;
        } else {
          validFiles.push(file);
        }
      });

      setInternalErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        onValidationError?.(newErrors);
      }

      return validFiles;
    },
    [maxFiles, files.length, onValidationError, validateFileSize, validateFileType, validateFile]
  );

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && dragAndDrop) {
      setIsDragActive(true);
      onDragOver?.(e);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && dragAndDrop) {
      setIsDragActive(false);
      onDragLeave?.(e);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && dragAndDrop) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragActive(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || !dragAndDrop) return;

    setIsDragActive(false);
    const droppedFiles = e.dataTransfer.files;

    if (droppedFiles.length > 0) {
      onDrop?.(droppedFiles);
      processFiles(droppedFiles);
    }
  };

  const processFiles = (fileList) => {
    const validFiles = validateFiles(fileList);

    if (validFiles.length === 0) return;

    if (multiple) {
      const newFiles = [...files, ...validFiles];
      onFilesSelected?.(newFiles);
    } else {
      onFilesSelected?.([validFiles[0]]);
    }

    // Auto upload if callback provided
    if (onFileUpload) {
      validFiles.forEach((file) => onFileUpload(file));
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesSelected?.(newFiles);
    onFileRemove?.(files[index], index);
  };

  const handleRetry = (file, index) => {
    onFileRetry?.(file, index);
  };

  const getAcceptedTypesString = () => {
    if (!accept) return 'All files';
    return accept
      .split(',')
      .map((type) => {
        if (type.startsWith('.')) return type;
        if (type.endsWith('/*')) return type.replace('/*', '');
        return type.split('/').pop();
      })
      .join(', ');
  };

  const renderFilePreview = (file, index) => {
    const isImage = file.type?.startsWith('image/');
    const progress = uploadProgress[file.name];
    const error = errors[file.name] || internalErrors[`${file.name}-${index}`];

    if (isImage && showPreview) {
      return (
        <FilePreview key={index}>
          <Box
            component="img"
            src={URL.createObjectURL(file)}
            alt={file.name}
            sx={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
          <FileActions className="file-actions">
            <IconButton size="small" onClick={() => window.open(URL.createObjectURL(file))}>
              <ViewIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleRemove(index)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </FileActions>
          {progress && progress < 100 && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderBottomLeftRadius: theme.spacing(1),
                borderBottomRightRadius: theme.spacing(1),
              }}
            />
          )}
        </FilePreview>
      );
    }

    return null;
  };

  return (
    <Box sx={{ width: '100%' }} {...props}>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
          {required && <span style={{ color: theme.palette.error.main }}> *</span>}
        </Typography>
      )}

      {/* Drop Zone */}
      {dropzone && (
        <DropZone
          isDragActive={isDragActive}
          error={error || Object.keys(internalErrors).length > 0}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          sx={{
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={disabled}
          />

          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: isDragActive ? 'primary.main' : 'text.secondary',
              mb: 2,
            }}
          />

          <Typography variant="body1" gutterBottom>
            {isDragActive ? 'Drop files here' : dropzoneText}
          </Typography>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AttachIcon />}
            sx={{ mt: 2 }}
            disabled={disabled}
          >
            {browseText}
          </Button>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {maxSize && `${maxSizeText} ${formatFileSize(maxSize)}`}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {accept && `${acceptedFilesText} ${getAcceptedTypesString()}`}
            </Typography>
          </Box>
        </DropZone>
      )}

      {/* File List */}
      {showList && files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => {
            const progress = uploadProgress[file.name];
            const error = errors[file.name] || internalErrors[`${file.name}-${index}`];
            const isUploading = progress && progress < 100;

            return (
              <ListItem
                key={index}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: error ? alpha(theme.palette.error.main, 0.02) : 'transparent',
                }}
              >
                <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {file.name}
                      </Typography>
                      <Chip label={formatFileSize(file.size)} size="small" variant="outlined" />
                    </Box>
                  }
                  secondary={
                    error ? (
                      <Typography variant="caption" color="error">
                        {error}
                      </Typography>
                    ) : isUploading ? (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress variant="determinate" value={progress} />
                      </Box>
                    ) : null
                  }
                />

                <ListItemSecondaryAction>
                  {error ? (
                    <IconButton edge="end" onClick={() => handleRetry(file, index)} size="small">
                      <RefreshIcon />
                    </IconButton>
                  ) : isUploading ? (
                    <IconButton edge="end" size="small" disabled>
                      <CancelIcon />
                    </IconButton>
                  ) : (
                    <>
                      <IconButton
                        edge="end"
                        onClick={() => window.open(URL.createObjectURL(file))}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemove(index)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      )}

      {/* File Previews */}
      {showPreview && files.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
          {files.map((file, index) => renderFilePreview(file, index))}
        </Box>
      )}

      {/* Helper Text */}
      {(helperText || error) && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 1, display: 'block' }}
        >
          {error || helperText}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
