/* eslint-disable no-unused-vars */
// src/components/youth/business/RevenueModel.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * RevenueModel Component
 * Helps businesses define their revenue streams and pricing strategy
 */
const RevenueModel = ({ initialData = {}, readOnly = false, onUpdate }) => {
  const [revenueStreams, setRevenueStreams] = useState(
    initialData.revenueStreams || [
      {
        id: '1',
        name: '',
        type: 'one-time',
        price: '',
        frequency: 'monthly',
        customers: '',
        projection: '',
        description: '',
      },
    ]
  );

  const [pricingStrategy, setPricingStrategy] = useState(
    initialData.pricingStrategy || {
      model: '',
      tiers: [],
      discounts: [],
      paymentTerms: '',
    }
  );

  const addRevenueStream = () => {
    const newStream = {
      id: Date.now().toString(),
      name: '',
      type: 'one-time',
      price: '',
      frequency: 'monthly',
      customers: '',
      projection: '',
      description: '',
    };
    setRevenueStreams([...revenueStreams, newStream]);
    if (onUpdate) {
      onUpdate({ revenueStreams: [...revenueStreams, newStream], pricingStrategy });
    }
  };

  const removeRevenueStream = (id) => {
    if (revenueStreams.length > 1) {
      const updated = revenueStreams.filter((s) => s.id !== id);
      setRevenueStreams(updated);
      if (onUpdate) {
        onUpdate({ revenueStreams: updated, pricingStrategy });
      }
    }
  };

  const updateRevenueStream = (id, field, value) => {
    const updated = revenueStreams.map((stream) => {
      if (stream.id === id) {
        return { ...stream, [field]: value };
      }
      return stream;
    });
    setRevenueStreams(updated);
    if (onUpdate) {
      onUpdate({ revenueStreams: updated, pricingStrategy });
    }
  };

  const updatePricingStrategy = (field, value) => {
    const updated = { ...pricingStrategy, [field]: value };
    setPricingStrategy(updated);
    if (onUpdate) {
      onUpdate({ revenueStreams, pricingStrategy: updated });
    }
  };

  const addTier = () => {
    const newTier = {
      id: Date.now().toString(),
      name: '',
      price: '',
      features: [],
    };
    updatePricingStrategy('tiers', [...(pricingStrategy.tiers || []), newTier]);
  };

  const removeTier = (id) => {
    const updated = (pricingStrategy.tiers || []).filter((t) => t.id !== id);
    updatePricingStrategy('tiers', updated);
  };

  const updateTier = (id, field, value) => {
    const updated = (pricingStrategy.tiers || []).map((tier) => {
      if (tier.id === id) {
        return { ...tier, [field]: value };
      }
      return tier;
    });
    updatePricingStrategy('tiers', updated);
  };

  const calculateProjectedRevenue = () => {
    return revenueStreams.reduce((total, stream) => {
      const price = parseFloat(stream.price) || 0;
      const customers = parseFloat(stream.customers) || 0;

      if (stream.type === 'one-time') {
        return total + price * customers;
      } else {
        // Recurring revenue
        const multiplier =
          stream.frequency === 'monthly' ? 12 : stream.frequency === 'quarterly' ? 4 : 1;
        return total + price * customers * multiplier;
      }
    }, 0);
  };

  return (
    <div className="revenue-model">
      <div className="model-header">
        <h3 className="model-title">
          <span className="title-icon">💰</span>
          Revenue Model
        </h3>
        {!readOnly && (
          <button className="btn btn-outline-primary btn-sm" onClick={addRevenueStream}>
            + Add Revenue Stream
          </button>
        )}
      </div>

      {/* Revenue Streams */}
      <div className="revenue-streams">
        <h4 className="section-title">Revenue Streams</h4>
        {revenueStreams.map((stream, index) => (
          <div key={stream.id} className="stream-card">
            <div className="stream-header">
              <h5 className="stream-title">
                Stream {index + 1}
                {!readOnly && revenueStreams.length > 1 && (
                  <button
                    className="btn-remove"
                    onClick={() => removeRevenueStream(stream.id)}
                    aria-label="Remove stream"
                  >
                    ×
                  </button>
                )}
              </h5>
            </div>

            <div className="stream-content">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stream Name</label>
                  {readOnly ? (
                    <p className="form-text">{stream.name || 'Not specified'}</p>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={stream.name}
                      onChange={(e) => updateRevenueStream(stream.id, 'name', e.target.value)}
                      placeholder="e.g., Product Sales, Subscriptions"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Revenue Type</label>
                  {readOnly ? (
                    <p className="form-text">{stream.type || 'Not specified'}</p>
                  ) : (
                    <select
                      className="form-control"
                      value={stream.type}
                      onChange={(e) => updateRevenueStream(stream.id, 'type', e.target.value)}
                    >
                      <option value="one-time">One-time</option>
                      <option value="recurring">Recurring</option>
                      <option value="usage-based">Usage-based</option>
                      <option value="license">License</option>
                      <option value="advertising">Advertising</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (per unit)</label>
                  {readOnly ? (
                    <p className="form-text">
                      {stream.price ? `$${stream.price}` : 'Not specified'}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="form-control"
                      value={stream.price}
                      onChange={(e) => updateRevenueStream(stream.id, 'price', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  )}
                </div>

                {stream.type === 'recurring' && (
                  <div className="form-group">
                    <label className="form-label">Billing Frequency</label>
                    {readOnly ? (
                      <p className="form-text">{stream.frequency || 'Not specified'}</p>
                    ) : (
                      <select
                        className="form-control"
                        value={stream.frequency}
                        onChange={(e) =>
                          updateRevenueStream(stream.id, 'frequency', e.target.value)
                        }
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                      </select>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Est. Customers</label>
                  {readOnly ? (
                    <p className="form-text">{stream.customers || 'Not specified'}</p>
                  ) : (
                    <input
                      type="number"
                      className="form-control"
                      value={stream.customers}
                      onChange={(e) => updateRevenueStream(stream.id, 'customers', e.target.value)}
                      placeholder="100"
                      min="0"
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                {readOnly ? (
                  <p className="form-text">{stream.description || 'Not specified'}</p>
                ) : (
                  <textarea
                    className="form-control"
                    rows={2}
                    value={stream.description}
                    onChange={(e) => updateRevenueStream(stream.id, 'description', e.target.value)}
                    placeholder="Describe this revenue stream"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Strategy */}
      <div className="pricing-strategy">
        <h4 className="section-title">Pricing Strategy</h4>

        <div className="form-group">
          <label className="form-label">Pricing Model</label>
          {readOnly ? (
            <p className="form-text">{pricingStrategy.model || 'Not specified'}</p>
          ) : (
            <select
              className="form-control"
              value={pricingStrategy.model}
              onChange={(e) => updatePricingStrategy('model', e.target.value)}
            >
              <option value="">Select pricing model</option>
              <option value="cost-plus">Cost Plus</option>
              <option value="value-based">Value-based</option>
              <option value="competitive">Competitive</option>
              <option value="tiered">Tiered/Packages</option>
              <option value="freemium">Freemium</option>
            </select>
          )}
        </div>

        {/* Pricing Tiers */}
        <div className="pricing-tiers">
          <div className="tiers-header">
            <label className="form-label">Pricing Tiers</label>
            {!readOnly && (
              <button className="btn btn-outline-primary btn-sm" onClick={addTier}>
                + Add Tier
              </button>
            )}
          </div>

          {(pricingStrategy.tiers || []).map((tier, index) => (
            <div key={tier.id} className="tier-card">
              <div className="tier-header">
                <h6 className="tier-title">Tier {index + 1}</h6>
                {!readOnly && (
                  <button
                    className="btn-remove"
                    onClick={() => removeTier(tier.id)}
                    aria-label="Remove tier"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tier Name</label>
                  {readOnly ? (
                    <p className="form-text">{tier.name || 'Not specified'}</p>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={tier.name}
                      onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                      placeholder="e.g., Basic, Pro, Enterprise"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Price</label>
                  {readOnly ? (
                    <p className="form-text">{tier.price ? `$${tier.price}` : 'Not specified'}</p>
                  ) : (
                    <input
                      type="number"
                      className="form-control"
                      value={tier.price}
                      onChange={(e) => updateTier(tier.id, 'price', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Features</label>
                {readOnly ? (
                  <div className="tags-list">
                    {tier.features?.map((feature, i) => (
                      <span key={i} className="tag">
                        {feature}
                      </span>
                    ))}
                    {(!tier.features || tier.features.length === 0) && (
                      <p className="form-text">None specified</p>
                    )}
                  </div>
                ) : (
                  <div className="tags-input">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type feature and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          const updated = [...(tier.features || []), e.target.value];
                          updateTier(tier.id, 'features', updated);
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="tags-list">
                      {tier.features?.map((feature, i) => (
                        <span key={i} className="tag">
                          {feature}
                          <button
                            className="tag-remove"
                            onClick={() => {
                              const updated = (tier.features || []).filter((f) => f !== feature);
                              updateTier(tier.id, 'features', updated);
                            }}
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
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Payment Terms</label>
          {readOnly ? (
            <p className="form-text">{pricingStrategy.paymentTerms || 'Not specified'}</p>
          ) : (
            <textarea
              className="form-control"
              rows={2}
              value={pricingStrategy.paymentTerms || ''}
              onChange={(e) => updatePricingStrategy('paymentTerms', e.target.value)}
              placeholder="e.g., Net 30, 50% upfront, etc."
            />
          )}
        </div>
      </div>

      {/* Revenue Projection */}
      <div className="revenue-projection">
        <h4 className="section-title">Revenue Projection</h4>
        <div className="projection-card">
          <div className="projection-amount">
            <span className="projection-label">Projected Annual Revenue:</span>
            <span className="projection-value">
              ${calculateProjectedRevenue().toLocaleString()}
            </span>
          </div>
          <p className="projection-note">
            *Based on current estimates. Update regularly as you validate assumptions.
          </p>
        </div>
      </div>

      <style jsx>{`
        .revenue-model {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
        }

        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .model-title {
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

        .section-title {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
        }

        .revenue-streams,
        .pricing-strategy,
        .revenue-projection {
          margin-bottom: 30px;
        }

        .stream-card,
        .tier-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .stream-header,
        .tier-header {
          background: #e9ecef;
          padding: 12px 16px;
          border-bottom: 1px solid #dee2e6;
        }

        .stream-title,
        .tier-title {
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

        .stream-content,
        .tier-card .form-group:last-child {
          padding: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
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

        .tiers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tiers-header .form-label {
          margin-bottom: 0;
        }

        .projection-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 20px;
          color: white;
        }

        .projection-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .projection-label {
          font-size: 1rem;
          opacity: 0.9;
        }

        .projection-value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .projection-note {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.8;
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

RevenueModel.propTypes = {
  initialData: PropTypes.shape({
    revenueStreams: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        price: PropTypes.string,
        frequency: PropTypes.string,
        customers: PropTypes.string,
        projection: PropTypes.string,
        description: PropTypes.string,
      })
    ),
    pricingStrategy: PropTypes.shape({
      model: PropTypes.string,
      tiers: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
          price: PropTypes.string,
          features: PropTypes.arrayOf(PropTypes.string),
        })
      ),
      discounts: PropTypes.array,
      paymentTerms: PropTypes.string,
    }),
  }),
  readOnly: PropTypes.bool,
  onUpdate: PropTypes.func,
};

export default RevenueModel;
