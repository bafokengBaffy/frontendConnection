/* eslint-disable no-unused-vars */
// src/components/youth/business/CustomerSegmentation.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * CustomerSegmentation Component
 * Helps businesses define and analyze their customer segments
 */
const CustomerSegmentation = ({ initialData = {}, readOnly = false, onUpdate }) => {
  const [segments, setSegments] = useState(
    initialData.segments || [
      {
        id: '1',
        name: '',
        description: '',
        characteristics: [],
        needs: [],
        size: '',
        growth: '',
        accessibility: '',
      },
    ]
  );

  const addSegment = () => {
    const newSegment = {
      id: Date.now().toString(),
      name: '',
      description: '',
      characteristics: [],
      needs: [],
      size: '',
      growth: '',
      accessibility: '',
    };
    setSegments([...segments, newSegment]);
  };

  const removeSegment = (id) => {
    if (segments.length > 1) {
      setSegments(segments.filter((s) => s.id !== id));
    }
  };

  const updateSegment = (id, field, value) => {
    const updatedSegments = segments.map((segment) => {
      if (segment.id === id) {
        return { ...segment, [field]: value };
      }
      return segment;
    });
    setSegments(updatedSegments);
    if (onUpdate) {
      onUpdate({ segments: updatedSegments });
    }
  };

  const updateArray = (id, field, item, action) => {
    const segment = segments.find((s) => s.id === id);
    if (!segment) return;

    let updatedArray = [...(segment[field] || [])];

    if (action === 'add' && item) {
      updatedArray.push(item);
    } else if (action === 'remove') {
      updatedArray = updatedArray.filter((i) => i !== item);
    }

    updateSegment(id, field, updatedArray);
  };

  return (
    <div className="customer-segmentation">
      <div className="segmentation-header">
        <h3 className="segmentation-title">
          <span className="title-icon">👥</span>
          Customer Segments
        </h3>
        {!readOnly && (
          <button className="btn btn-outline-primary btn-sm" onClick={addSegment}>
            + Add Segment
          </button>
        )}
      </div>

      <div className="segments-grid">
        {segments.map((segment, index) => (
          <div key={segment.id} className="segment-card">
            <div className="segment-header">
              <h4 className="segment-title">
                Segment {index + 1}
                {!readOnly && segments.length > 1 && (
                  <button
                    className="btn-remove"
                    onClick={() => removeSegment(segment.id)}
                    aria-label="Remove segment"
                  >
                    ×
                  </button>
                )}
              </h4>
            </div>

            <div className="segment-content">
              <div className="form-group">
                <label className="form-label">Segment Name</label>
                {readOnly ? (
                  <p className="form-text">{segment.name || 'Not specified'}</p>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={segment.name}
                    onChange={(e) => updateSegment(segment.id, 'name', e.target.value)}
                    placeholder="e.g., Young Professionals, Small Business Owners"
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                {readOnly ? (
                  <p className="form-text">{segment.description || 'Not specified'}</p>
                ) : (
                  <textarea
                    className="form-control"
                    rows={2}
                    value={segment.description}
                    onChange={(e) => updateSegment(segment.id, 'description', e.target.value)}
                    placeholder="Describe this customer segment"
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Key Characteristics</label>
                {readOnly ? (
                  <div className="tags-list">
                    {segment.characteristics?.map((char, i) => (
                      <span key={i} className="tag">
                        {char}
                      </span>
                    ))}
                    {(!segment.characteristics || segment.characteristics.length === 0) && (
                      <p className="form-text">None specified</p>
                    )}
                  </div>
                ) : (
                  <div className="tags-input">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type and press Enter to add"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          updateArray(segment.id, 'characteristics', e.target.value, 'add');
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="tags-list">
                      {segment.characteristics?.map((char, i) => (
                        <span key={i} className="tag">
                          {char}
                          <button
                            className="tag-remove"
                            onClick={() =>
                              updateArray(segment.id, 'characteristics', char, 'remove')
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Needs & Pain Points</label>
                {readOnly ? (
                  <div className="tags-list">
                    {segment.needs?.map((need, i) => (
                      <span key={i} className="tag">
                        {need}
                      </span>
                    ))}
                    {(!segment.needs || segment.needs.length === 0) && (
                      <p className="form-text">None specified</p>
                    )}
                  </div>
                ) : (
                  <div className="tags-input">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type and press Enter to add"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          updateArray(segment.id, 'needs', e.target.value, 'add');
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="tags-list">
                      {segment.needs?.map((need, i) => (
                        <span key={i} className="tag">
                          {need}
                          <button
                            className="tag-remove"
                            onClick={() => updateArray(segment.id, 'needs', need, 'remove')}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Market Size</label>
                  {readOnly ? (
                    <p className="form-text">{segment.size || 'Not specified'}</p>
                  ) : (
                    <select
                      className="form-control"
                      value={segment.size}
                      onChange={(e) => updateSegment(segment.id, 'size', e.target.value)}
                    >
                      <option value="">Select size</option>
                      <option value="small">Small (&lt; 1,000)</option>
                      <option value="medium">Medium (1,000 - 10,000)</option>
                      <option value="large">Large (10,000 - 100,000)</option>
                      <option value="enterprise">Enterprise (100,000+)</option>
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Growth Rate</label>
                  {readOnly ? (
                    <p className="form-text">{segment.growth || 'Not specified'}</p>
                  ) : (
                    <select
                      className="form-control"
                      value={segment.growth}
                      onChange={(e) => updateSegment(segment.id, 'growth', e.target.value)}
                    >
                      <option value="">Select growth</option>
                      <option value="declining">Declining</option>
                      <option value="stable">Stable</option>
                      <option value="growing">Growing</option>
                      <option value="rapid">Rapid Growth</option>
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Accessibility</label>
                  {readOnly ? (
                    <p className="form-text">{segment.accessibility || 'Not specified'}</p>
                  ) : (
                    <select
                      className="form-control"
                      value={segment.accessibility}
                      onChange={(e) => updateSegment(segment.id, 'accessibility', e.target.value)}
                    >
                      <option value="">Select accessibility</option>
                      <option value="easy">Easy to reach</option>
                      <option value="moderate">Moderate effort</option>
                      <option value="difficult">Difficult to reach</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .customer-segmentation {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
        }

        .segmentation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .segmentation-title {
          margin: 0;
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

        .segments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .segment-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }

        .segment-header {
          background: #e9ecef;
          padding: 12px 16px;
          border-bottom: 1px solid #dee2e6;
        }

        .segment-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #495057;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-remove {
          background: none;
          border: none;
          color: #dc3545;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 4px;
        }

        .btn-remove:hover {
          color: #c82333;
        }

        .segment-content {
          padding: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        .form-label {
          display: block;
          margin-bottom: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #495057;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
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
          font-size: 0.9rem;
        }

        .tags-input {
          border: 1px solid #ced4da;
          border-radius: 4px;
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

        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .btn-outline-primary {
          background: transparent;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .btn-outline-primary:hover {
          background: #3b82f6;
          color: white;
        }

        .btn-sm {
          padding: 4px 12px;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

CustomerSegmentation.propTypes = {
  initialData: PropTypes.shape({
    segments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
        characteristics: PropTypes.arrayOf(PropTypes.string),
        needs: PropTypes.arrayOf(PropTypes.string),
        size: PropTypes.string,
        growth: PropTypes.string,
        accessibility: PropTypes.string,
      })
    ),
  }),
  readOnly: PropTypes.bool,
  onUpdate: PropTypes.func,
};

export default CustomerSegmentation;
