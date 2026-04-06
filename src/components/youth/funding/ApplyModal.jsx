/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../../layout/LoadingSpinner'; // Fixed: default import, not named import
import './FundingComponents.css';

/**
 * ApplyModal Component
 * Modal for applying to funding opportunities
 */
const ApplyModal = ({ opportunity, onClose, user, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    amount: opportunity.amount?.min || '',
    purpose: '',
    timeline: '',
    experience: '',
    documents: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    } else if (step === 2) {
      if (!formData.amount) newErrors.amount = 'Requested amount is required';
      if (opportunity.amount?.min && formData.amount < opportunity.amount.min)
        newErrors.amount = `Minimum amount is $${opportunity.amount.min}`;
      if (opportunity.amount?.max && formData.amount > opportunity.amount.max)
        newErrors.amount = `Maximum amount is $${opportunity.amount.max}`;
      if (!formData.purpose) newErrors.purpose = 'Purpose is required';
      if (formData.purpose.length < 50)
        newErrors.purpose = 'Purpose must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'documents') {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRemoveDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="apply-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="modal-header">
          <h2>Apply for {opportunity.title}</h2>
          <p className="modal-subtitle">Step {step} of 3</p>
        </div>

        <div className="modal-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Personal Info</span>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Application Details</span>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Documents</span>
          </div>
        </div>

        <div className="modal-content">
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <span id="fullName-error" className="error-message">
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <span id="email-error" className="error-message">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <span id="phone-error" className="error-message">
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="amount">Requested Amount *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min={opportunity.amount?.min}
                  max={opportunity.amount?.max}
                  className={errors.amount ? 'error' : ''}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                />
                {opportunity.amount && (
                  <small className="amount-hint">
                    Range: ${opportunity.amount.min?.toLocaleString()} - $
                    {opportunity.amount.max?.toLocaleString()}
                  </small>
                )}
                {errors.amount && (
                  <span id="amount-error" className="error-message">
                    {errors.amount}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="purpose">Purpose / Business Plan *</label>
                <textarea
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  rows="5"
                  className={errors.purpose ? 'error' : ''}
                  placeholder="Describe how you'll use the funds..."
                  aria-describedby={errors.purpose ? 'purpose-error' : undefined}
                />
                <small className="character-count">{formData.purpose.length} / 50 minimum</small>
                {errors.purpose && (
                  <span id="purpose-error" className="error-message">
                    {errors.purpose}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="timeline">Expected Timeline</label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                >
                  <option value="">Select timeline...</option>
                  <option value="immediate">Immediate (0-3 months)</option>
                  <option value="short">Short-term (3-6 months)</option>
                  <option value="medium">Medium-term (6-12 months)</option>
                  <option value="long">Long-term (12+ months)</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="experience">Relevant Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your relevant experience and qualifications..."
                />
              </div>

              <div className="form-group">
                <label>Required Documents</label>
                <div className="document-upload">
                  <input
                    type="file"
                    id="documents"
                    name="documents"
                    onChange={handleChange}
                    multiple
                    accept=".pdf,.doc,.docx"
                  />
                  <label htmlFor="documents" className="upload-btn">
                    📎 Upload Documents
                  </label>
                </div>

                {formData.documents.length > 0 && (
                  <ul className="document-list">
                    {formData.documents.map((doc, index) => (
                      <li key={index} className="document-item">
                        <span className="document-name">{doc.name}</span>
                        <span className="document-size">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <button
                          onClick={() => handleRemoveDocument(index)}
                          className="remove-document"
                          aria-label={`Remove ${doc.name}`}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="submit-error" role="alert">
              {errors.submit}
            </div>
          )}
        </div>

        <div className="modal-actions">
          {step > 1 && (
            <button onClick={handleBack} className="btn btn-secondary" disabled={loading}>
              Back
            </button>
          )}

          {step < 3 ? (
            <button onClick={handleNext} className="btn btn-primary">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ApplyModal.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    amount: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string,
  }),
  onSuccess: PropTypes.func.isRequired,
};

export default ApplyModal;
