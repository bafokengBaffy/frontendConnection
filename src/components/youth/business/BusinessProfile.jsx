/* eslint-disable no-unused-vars */
// src/components/youth/business/BusinessProfile.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * BusinessProfile Component
 * Manages basic business information and profile details
 */
const BusinessProfile = ({ initialData = {}, readOnly = false, onUpdate }) => {
  const [profile, setProfile] = useState({
    // Basic Information
    businessName: initialData.businessName || '',
    legalName: initialData.legalName || '',
    registrationNumber: initialData.registrationNumber || '',
    taxId: initialData.taxId || '',

    // Description
    tagline: initialData.tagline || '',
    description: initialData.description || '',
    shortDescription: initialData.shortDescription || '',

    // Contact Information
    email: initialData.email || '',
    phone: initialData.phone || '',
    website: initialData.website || '',
    socialMedia: initialData.socialMedia || {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },

    // Location
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    country: initialData.country || '',
    postalCode: initialData.postalCode || '',

    // Business Details
    foundedDate: initialData.foundedDate || '',
    businessStage: initialData.businessStage || 'idea',
    numberOfEmployees: initialData.numberOfEmployees || '',
    legalStructure: initialData.legalStructure || '',

    // Industry & Categories
    industry: initialData.industry || '',
    subIndustry: initialData.subIndustry || '',
    tags: initialData.tags || [],

    // Logo & Branding
    logo: initialData.logo || '',
    coverImage: initialData.coverImage || '',
    brandColor: initialData.brandColor || '#3b82f6',

    // Verification Status
    verified: initialData.verified || false,
    verificationDate: initialData.verificationDate || null,
  });

  const updateField = (field, value) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const updateNestedField = (parent, field, value) => {
    const updated = {
      ...profile,
      [parent]: {
        ...profile[parent],
        [field]: value,
      },
    };
    setProfile(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const addTag = (tag) => {
    if (tag && !profile.tags.includes(tag)) {
      const updated = { ...profile, tags: [...profile.tags, tag] };
      setProfile(updated);
      if (onUpdate) {
        onUpdate(updated);
      }
    }
  };

  const removeTag = (index) => {
    const updated = {
      ...profile,
      tags: profile.tags.filter((_, i) => i !== index),
    };
    setProfile(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const handleImageUpload = (type, file) => {
    // In a real implementation, this would upload to cloud storage
    // For now, we'll create a local object URL
    const url = URL.createObjectURL(file);
    updateField(type, url);
  };

  return (
    <div className="business-profile">
      <h3 className="profile-title">
        <span className="title-icon">🏢</span>
        Business Profile
      </h3>

      {/* Logo & Cover Section */}
      <div className="media-section">
        <div className="cover-image-container">
          {profile.coverImage ? (
            <img src={profile.coverImage} alt="Cover" className="cover-image" />
          ) : (
            <div className="cover-placeholder">
              <span className="placeholder-icon">🖼️</span>
              <span>Cover Image</span>
            </div>
          )}
          {!readOnly && (
            <label className="cover-upload-btn">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('coverImage', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <span className="upload-icon">📸</span>
              Change Cover
            </label>
          )}
        </div>

        <div className="logo-container">
          {profile.logo ? (
            <img src={profile.logo} alt={`${profile.businessName} logo`} className="logo-image" />
          ) : (
            <div className="logo-placeholder" style={{ backgroundColor: profile.brandColor }}>
              <span className="logo-initials">
                {profile.businessName
                  ? profile.businessName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : '🏢'}
              </span>
            </div>
          )}
          {!readOnly && (
            <label className="logo-upload-btn">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('logo', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <span className="upload-icon">📷</span>
            </label>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="profile-section">
        <h4 className="section-title">Basic Information</h4>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Business Name *</label>
            {readOnly ? (
              <p className="form-text">{profile.businessName || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder="e.g., TechStart Solutions"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Legal Name</label>
            {readOnly ? (
              <p className="form-text">{profile.legalName || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.legalName}
                onChange={(e) => updateField('legalName', e.target.value)}
                placeholder="Registered business name"
              />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Registration Number</label>
            {readOnly ? (
              <p className="form-text">{profile.registrationNumber || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.registrationNumber}
                onChange={(e) => updateField('registrationNumber', e.target.value)}
                placeholder="Business registration number"
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tax ID / VAT Number</label>
            {readOnly ? (
              <p className="form-text">{profile.taxId || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.taxId}
                onChange={(e) => updateField('taxId', e.target.value)}
                placeholder="Tax identification number"
              />
            )}
          </div>
        </div>
      </div>

      {/* Business Description */}
      <div className="profile-section">
        <h4 className="section-title">Business Description</h4>

        <div className="form-group">
          <label className="form-label">Tagline</label>
          {readOnly ? (
            <p className="form-text">{profile.tagline || 'Not specified'}</p>
          ) : (
            <input
              type="text"
              className="form-control"
              value={profile.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              placeholder="Short, catchy description (max 100 characters)"
              maxLength="100"
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Short Description</label>
          {readOnly ? (
            <p className="form-text">{profile.shortDescription || 'Not specified'}</p>
          ) : (
            <textarea
              className="form-control"
              rows={2}
              value={profile.shortDescription}
              onChange={(e) => updateField('shortDescription', e.target.value)}
              placeholder="Brief overview for listings (max 200 characters)"
              maxLength="200"
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Full Description</label>
          {readOnly ? (
            <p className="form-text">{profile.description || 'Not specified'}</p>
          ) : (
            <textarea
              className="form-control"
              rows={4}
              value={profile.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Detailed description of your business, mission, and vision"
            />
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="profile-section">
        <h4 className="section-title">Contact Information</h4>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email *</label>
            {readOnly ? (
              <p className="form-text">{profile.email || 'Not specified'}</p>
            ) : (
              <input
                type="email"
                className="form-control"
                value={profile.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="contact@business.com"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            {readOnly ? (
              <p className="form-text">{profile.phone || 'Not specified'}</p>
            ) : (
              <input
                type="tel"
                className="form-control"
                value={profile.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+266 1234 5678"
              />
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Website</label>
          {readOnly ? (
            <p className="form-text">{profile.website || 'Not specified'}</p>
          ) : (
            <input
              type="url"
              className="form-control"
              value={profile.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://www.yourbusiness.com"
            />
          )}
        </div>

        <div className="social-media-section">
          <h5 className="subsection-title">Social Media</h5>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Facebook</label>
              {readOnly ? (
                <p className="form-text">{profile.socialMedia.facebook || 'Not specified'}</p>
              ) : (
                <input
                  type="url"
                  className="form-control"
                  value={profile.socialMedia.facebook}
                  onChange={(e) => updateNestedField('socialMedia', 'facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Twitter</label>
              {readOnly ? (
                <p className="form-text">{profile.socialMedia.twitter || 'Not specified'}</p>
              ) : (
                <input
                  type="url"
                  className="form-control"
                  value={profile.socialMedia.twitter}
                  onChange={(e) => updateNestedField('socialMedia', 'twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">LinkedIn</label>
              {readOnly ? (
                <p className="form-text">{profile.socialMedia.linkedin || 'Not specified'}</p>
              ) : (
                <input
                  type="url"
                  className="form-control"
                  value={profile.socialMedia.linkedin}
                  onChange={(e) => updateNestedField('socialMedia', 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Instagram</label>
              {readOnly ? (
                <p className="form-text">{profile.socialMedia.instagram || 'Not specified'}</p>
              ) : (
                <input
                  type="url"
                  className="form-control"
                  value={profile.socialMedia.instagram}
                  onChange={(e) => updateNestedField('socialMedia', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/yourprofile"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="profile-section">
        <h4 className="section-title">Location</h4>

        <div className="form-group">
          <label className="form-label">Street Address</label>
          {readOnly ? (
            <p className="form-text">{profile.address || 'Not specified'}</p>
          ) : (
            <input
              type="text"
              className="form-control"
              value={profile.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Street address"
            />
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            {readOnly ? (
              <p className="form-text">{profile.city || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City"
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">State/Province</label>
            {readOnly ? (
              <p className="form-text">{profile.state || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="State or province"
              />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Country</label>
            {readOnly ? (
              <p className="form-text">{profile.country || 'Not specified'}</p>
            ) : (
              <select
                className="form-control"
                value={profile.country}
                onChange={(e) => updateField('country', e.target.value)}
              >
                <option value="">Select country</option>
                <option value="LS">Lesotho</option>
                <option value="ZA">South Africa</option>
                <option value="BW">Botswana</option>
                <option value="NA">Namibia</option>
                <option value="SZ">Eswatini</option>
                <option value="ZW">Zimbabwe</option>
                <option value="MZ">Mozambique</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Postal Code</label>
            {readOnly ? (
              <p className="form-text">{profile.postalCode || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                placeholder="Postal code"
              />
            )}
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="profile-section">
        <h4 className="section-title">Business Details</h4>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Founded Date</label>
            {readOnly ? (
              <p className="form-text">{profile.foundedDate || 'Not specified'}</p>
            ) : (
              <input
                type="date"
                className="form-control"
                value={profile.foundedDate}
                onChange={(e) => updateField('foundedDate', e.target.value)}
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Business Stage</label>
            {readOnly ? (
              <p className="form-text">{profile.businessStage || 'Not specified'}</p>
            ) : (
              <select
                className="form-control"
                value={profile.businessStage}
                onChange={(e) => updateField('businessStage', e.target.value)}
              >
                <option value="idea">Idea / Concept</option>
                <option value="validation">Validation</option>
                <option value="startup">Startup</option>
                <option value="growth">Growth</option>
                <option value="established">Established</option>
              </select>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Number of Employees</label>
            {readOnly ? (
              <p className="form-text">{profile.numberOfEmployees || 'Not specified'}</p>
            ) : (
              <select
                className="form-control"
                value={profile.numberOfEmployees}
                onChange={(e) => updateField('numberOfEmployees', e.target.value)}
              >
                <option value="">Select size</option>
                <option value="1">Solo (1)</option>
                <option value="2-5">Micro (2-5)</option>
                <option value="6-10">Very Small (6-10)</option>
                <option value="11-50">Small (11-50)</option>
                <option value="51-200">Medium (51-200)</option>
                <option value="201-500">Large (201-500)</option>
                <option value="500+">Enterprise (500+)</option>
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Legal Structure</label>
            {readOnly ? (
              <p className="form-text">{profile.legalStructure || 'Not specified'}</p>
            ) : (
              <select
                className="form-control"
                value={profile.legalStructure}
                onChange={(e) => updateField('legalStructure', e.target.value)}
              >
                <option value="">Select structure</option>
                <option value="sole-proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="llc">LLC (Limited Liability Company)</option>
                <option value="pty">Pty Ltd (Private Company)</option>
                <option value="non-profit">Non-Profit</option>
                <option value="cooperative">Cooperative</option>
              </select>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Industry</label>
            {readOnly ? (
              <p className="form-text">{profile.industry || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                placeholder="e.g., Technology, Healthcare"
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Sub-Industry</label>
            {readOnly ? (
              <p className="form-text">{profile.subIndustry || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile.subIndustry}
                onChange={(e) => updateField('subIndustry', e.target.value)}
                placeholder="e.g., SaaS, Medical Devices"
              />
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Tags / Keywords</label>
          {readOnly ? (
            <div className="tags-list">
              {profile.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
              {profile.tags.length === 0 && <p className="form-text">No tags specified</p>}
            </div>
          ) : (
            <div className="tags-input">
              <input
                type="text"
                className="form-control"
                placeholder="Type a tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    addTag(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <div className="tags-list">
                {profile.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      className="tag-remove"
                      onClick={() => removeTag(index)}
                      aria-label="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Brand Color */}
      <div className="profile-section">
        <h4 className="section-title">Brand Color</h4>

        <div className="color-picker-section">
          <div className="color-preview" style={{ backgroundColor: profile.brandColor }} />
          {readOnly ? (
            <p className="form-text">{profile.brandColor}</p>
          ) : (
            <input
              type="color"
              className="color-picker"
              value={profile.brandColor}
              onChange={(e) => updateField('brandColor', e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Verification Status */}
      {profile.verified && (
        <div className="verification-badge">
          <span className="verified-icon">✓</span>
          <span>Verified Business</span>
          {profile.verificationDate && (
            <span className="verification-date">
              Verified on {new Date(profile.verificationDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      <style jsx>{`
        .business-profile {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
        }

        .profile-title {
          margin: 0 0 24px 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .title-icon {
          font-size: 1.5rem;
        }

        .media-section {
          position: relative;
          margin-bottom: 40px;
        }

        .cover-image-container {
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
        }

        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: 8px;
        }

        .cover-upload-btn {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .cover-upload-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .logo-container {
          position: absolute;
          bottom: -40px;
          left: 24px;
          width: 120px;
          height: 120px;
          border-radius: 60px;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          background: white;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .logo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          font-weight: bold;
        }

        .logo-initials {
          font-size: 2.5rem;
          font-weight: 600;
        }

        .logo-upload-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          border: 2px solid white;
          transition: background 0.2s;
        }

        .logo-upload-btn:hover {
          background: #2563eb;
        }

        .upload-icon {
          font-size: 1rem;
        }

        .profile-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .profile-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-title {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
        }

        .subsection-title {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 500;
          color: #6c757d;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #495057;
        }

        .form-control {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-text {
          margin: 0;
          padding: 8px 0;
          color: #6c757d;
          font-size: 0.95rem;
        }

        .social-media-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .tags-input {
          border: 1px solid #ced4da;
          border-radius: 6px;
          overflow: hidden;
        }

        .tags-input .form-control {
          border: none;
          border-bottom: 1px solid #ced4da;
          border-radius: 0;
        }

        .tags-list {
          padding: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          background: #f8f9fa;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #e9ecef;
          border-radius: 4px;
          font-size: 0.85rem;
          color: #495057;
        }

        .tag-remove {
          background: none;
          border: none;
          color: #6c757d;
          font-size: 1rem;
          cursor: pointer;
          padding: 0 2px;
        }

        .tag-remove:hover {
          color: #dc3545;
        }

        .color-picker-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .color-preview {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          border: 2px solid #dee2e6;
        }

        .color-picker {
          width: 100px;
          height: 50px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          cursor: pointer;
        }

        .verification-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #d4edda;
          color: #155724;
          border-radius: 20px;
          font-size: 0.95rem;
          margin-top: 16px;
        }

        .verified-icon {
          font-size: 1.1rem;
          font-weight: bold;
        }

        .verification-date {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .logo-container {
            width: 80px;
            height: 80px;
            bottom: -30px;
          }

          .logo-initials {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};

BusinessProfile.propTypes = {
  initialData: PropTypes.shape({
    businessName: PropTypes.string,
    legalName: PropTypes.string,
    registrationNumber: PropTypes.string,
    taxId: PropTypes.string,
    tagline: PropTypes.string,
    description: PropTypes.string,
    shortDescription: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    website: PropTypes.string,
    socialMedia: PropTypes.object,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    country: PropTypes.string,
    postalCode: PropTypes.string,
    foundedDate: PropTypes.string,
    businessStage: PropTypes.string,
    numberOfEmployees: PropTypes.string,
    legalStructure: PropTypes.string,
    industry: PropTypes.string,
    subIndustry: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    logo: PropTypes.string,
    coverImage: PropTypes.string,
    brandColor: PropTypes.string,
    verified: PropTypes.bool,
    verificationDate: PropTypes.any,
  }),
  readOnly: PropTypes.bool,
  onUpdate: PropTypes.func,
};

export default BusinessProfile;
