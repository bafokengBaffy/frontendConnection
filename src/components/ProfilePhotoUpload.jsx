/* eslint-disable no-undef */
// components/ProfilePhotoUpload.jsx
import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import './ProfilePhotoUpload.css';

export const ProfilePhotoUpload = ({
  currentPhoto,
  onUpload,
  uploading,
  uploadProgress,
  size = 'medium',
  editable = true,
}) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload
      await onUpload(file);
      setPreview(null);
    },
    [onUpload]
  );

  const handleClick = useCallback(() => {
    if (editable && !uploading) {
      fileInputRef.current?.click();
    }
  }, [editable, uploading]);

  return (
    <div className={`profile-photo-upload ${size}`}>
      <div
        className={`photo-container ${editable ? 'editable' : ''} ${uploading ? 'uploading' : ''}`}
        onClick={handleClick}
        role={editable ? 'button' : 'presentation'}
        tabIndex={editable ? 0 : -1}
        onKeyPress={editable ? (e) => e.key === 'Enter' && handleClick() : undefined}
      >
        {(preview || currentPhoto) && (
          <img
            src={preview || currentPhoto}
            alt="Profile"
            className="profile-photo"
            loading="lazy"
          />
        )}

        {editable && (
          <div className="photo-overlay">
            <span className="upload-icon">{uploading ? '⏳' : '📷'}</span>
            <span className="upload-text">{uploading ? 'Uploading...' : 'Change Photo'}</span>
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
        aria-hidden="true"
      />
    </div>
  );
};

ProfilePhotoUpload.propTypes = {
  currentPhoto: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  uploading: PropTypes.bool,
  uploadProgress: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  editable: PropTypes.bool,
};
