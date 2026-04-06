/* eslint-disable no-unused-vars */
// src/components/youth/business/ValueProposition.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ValueProposition Component
 * Helps businesses define their unique value proposition
 */
const ValueProposition = ({ initialData = {}, readOnly = false, onUpdate }) => {
  const [valueProp, setValueProp] = useState({
    headline: initialData.headline || '',
    subheadline: initialData.subheadline || '',
    problem: initialData.problem || '',
    solution: initialData.solution || '',
    uniqueValue: initialData.uniqueValue || '',
    benefits: initialData.benefits || [],
    differentiators: initialData.differentiators || [],
    proof: initialData.proof || [],
  });

  const updateField = (field, value) => {
    const updated = { ...valueProp, [field]: value };
    setValueProp(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const addItem = (field, item) => {
    const updated = { ...valueProp, [field]: [...(valueProp[field] || []), item] };
    setValueProp(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const removeItem = (field, index) => {
    const updated = {
      ...valueProp,
      [field]: (valueProp[field] || []).filter((_, i) => i !== index),
    };
    setValueProp(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  return (
    <div className="value-proposition">
      <h3 className="vp-title">
        <span className="title-icon">💡</span>
        Value Proposition
      </h3>

      <div className="vp-section">
        <h4 className="section-title">Headline</h4>
        <div className="form-group">
          {readOnly ? (
            <p className="form-text">{valueProp.headline || 'Not specified'}</p>
          ) : (
            <>
              <input
                type="text"
                className="form-control"
                value={valueProp.headline}
                onChange={(e) => updateField('headline', e.target.value)}
                placeholder="e.g., The easiest way to manage your business finances"
              />
              <small className="form-hint">
                Clear, concise statement of your value (5-10 words)
              </small>
            </>
          )}
        </div>

        <h4 className="section-title">Subheadline</h4>
        <div className="form-group">
          {readOnly ? (
            <p className="form-text">{valueProp.subheadline || 'Not specified'}</p>
          ) : (
            <>
              <textarea
                className="form-control"
                rows={2}
                value={valueProp.subheadline}
                onChange={(e) => updateField('subheadline', e.target.value)}
                placeholder="e.g., Save time and reduce errors with automated bookkeeping and reporting"
              />
              <small className="form-hint">Elaborate on your headline (1-2 sentences)</small>
            </>
          )}
        </div>
      </div>

      <div className="vp-section">
        <h4 className="section-title">Problem & Solution</h4>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Problem Statement</label>
            {readOnly ? (
              <p className="form-text">{valueProp.problem || 'Not specified'}</p>
            ) : (
              <textarea
                className="form-control"
                rows={3}
                value={valueProp.problem}
                onChange={(e) => updateField('problem', e.target.value)}
                placeholder="What problem are you solving for your customers?"
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Solution</label>
            {readOnly ? (
              <p className="form-text">{valueProp.solution || 'Not specified'}</p>
            ) : (
              <textarea
                className="form-control"
                rows={3}
                value={valueProp.solution}
                onChange={(e) => updateField('solution', e.target.value)}
                placeholder="How does your product/service solve this problem?"
              />
            )}
          </div>
        </div>
      </div>

      <div className="vp-section">
        <h4 className="section-title">Unique Value</h4>
        <div className="form-group">
          <label className="form-label">What makes you unique?</label>
          {readOnly ? (
            <p className="form-text">{valueProp.uniqueValue || 'Not specified'}</p>
          ) : (
            <textarea
              className="form-control"
              rows={3}
              value={valueProp.uniqueValue}
              onChange={(e) => updateField('uniqueValue', e.target.value)}
              placeholder="What sets you apart from competitors?"
            />
          )}
        </div>
      </div>

      <div className="vp-section">
        <h4 className="section-title">Key Benefits</h4>
        {readOnly ? (
          <div className="benefits-list">
            {valueProp.benefits?.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>{benefit}</span>
              </div>
            ))}
            {(!valueProp.benefits || valueProp.benefits.length === 0) && (
              <p className="form-text">No benefits specified</p>
            )}
          </div>
        ) : (
          <div className="benefits-input">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Add a benefit and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    addItem('benefits', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="benefits-list">
              {valueProp.benefits?.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>{benefit}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('benefits', index)}
                    aria-label="Remove benefit"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="vp-section">
        <h4 className="section-title">Differentiators</h4>
        {readOnly ? (
          <div className="differentiators-list">
            {valueProp.differentiators?.map((item, index) => (
              <div key={index} className="differentiator-item">
                <span className="differentiator-icon">⚡</span>
                <span>{item}</span>
              </div>
            ))}
            {(!valueProp.differentiators || valueProp.differentiators.length === 0) && (
              <p className="form-text">No differentiators specified</p>
            )}
          </div>
        ) : (
          <div className="differentiators-input">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Add a differentiator and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    addItem('differentiators', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="differentiators-list">
              {valueProp.differentiators?.map((item, index) => (
                <div key={index} className="differentiator-item">
                  <span className="differentiator-icon">⚡</span>
                  <span>{item}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('differentiators', index)}
                    aria-label="Remove differentiator"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="vp-section">
        <h4 className="section-title">Proof Points</h4>
        {readOnly ? (
          <div className="proof-list">
            {valueProp.proof?.map((item, index) => (
              <div key={index} className="proof-item">
                <span className="proof-icon">📊</span>
                <span>{item}</span>
              </div>
            ))}
            {(!valueProp.proof || valueProp.proof.length === 0) && (
              <p className="form-text">No proof points specified</p>
            )}
          </div>
        ) : (
          <div className="proof-input">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Add proof point (e.g., customer testimonial, statistic)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    addItem('proof', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="proof-list">
              {valueProp.proof?.map((item, index) => (
                <div key={index} className="proof-item">
                  <span className="proof-icon">📊</span>
                  <span>{item}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('proof', index)}
                    aria-label="Remove proof point"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .value-proposition {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
        }

        .vp-title {
          margin: 0 0 24px 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .title-icon {
          font-size: 1.4rem;
        }

        .vp-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .vp-section:last-child {
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
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

        .form-hint {
          display: block;
          margin-top: 4px;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .form-text {
          margin: 0;
          padding: 8px 0;
          color: #6c757d;
          font-size: 0.95rem;
        }

        .benefits-list,
        .differentiators-list,
        .proof-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .benefit-item,
        .differentiator-item,
        .proof-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .benefit-icon {
          color: #28a745;
          font-weight: bold;
        }

        .differentiator-icon {
          color: #ffc107;
        }

        .proof-icon {
          color: #17a2b8;
        }

        .btn-remove {
          background: none;
          border: none;
          color: #dc3545;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0 4px;
          margin-left: auto;
        }

        .btn-remove:hover {
          color: #c82333;
        }

        .input-group {
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

ValueProposition.propTypes = {
  initialData: PropTypes.shape({
    headline: PropTypes.string,
    subheadline: PropTypes.string,
    problem: PropTypes.string,
    solution: PropTypes.string,
    uniqueValue: PropTypes.string,
    benefits: PropTypes.arrayOf(PropTypes.string),
    differentiators: PropTypes.arrayOf(PropTypes.string),
    proof: PropTypes.arrayOf(PropTypes.string),
  }),
  readOnly: PropTypes.bool,
  onUpdate: PropTypes.func,
};

export default ValueProposition;
