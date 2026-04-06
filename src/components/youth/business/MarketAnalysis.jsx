/* eslint-disable no-unused-vars */
// src/components/youth/business/MarketAnalysis.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * MarketAnalysis Component
 * Helps businesses analyze their market, competition, and industry trends
 */
const MarketAnalysis = ({ initialData = {}, readOnly = false, onUpdate }) => {
  const [marketData, setMarketData] = useState({
    industry: initialData.industry || '',
    targetMarket: initialData.targetMarket || '',
    marketSize: initialData.marketSize || {
      tam: '',
      sam: '',
      som: '',
    },
    trends: initialData.trends || [],
    competitors: initialData.competitors || [
      {
        id: '1',
        name: '',
        strengths: [],
        weaknesses: [],
        marketShare: '',
        pricing: '',
        differentiator: '',
      },
    ],
    marketNeeds: initialData.marketNeeds || [],
    barriers: initialData.barriers || [],
    regulations: initialData.regulations || [],
  });

  const updateField = (field, value) => {
    const updated = { ...marketData, [field]: value };
    setMarketData(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const updateNestedField = (parent, field, value) => {
    const updated = {
      ...marketData,
      [parent]: {
        ...marketData[parent],
        [field]: value,
      },
    };
    setMarketData(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const addCompetitor = () => {
    const newCompetitor = {
      id: Date.now().toString(),
      name: '',
      strengths: [],
      weaknesses: [],
      marketShare: '',
      pricing: '',
      differentiator: '',
    };
    updateField('competitors', [...marketData.competitors, newCompetitor]);
  };

  const updateCompetitor = (id, field, value) => {
    const updated = marketData.competitors.map((comp) => {
      if (comp.id === id) {
        return { ...comp, [field]: value };
      }
      return comp;
    });
    updateField('competitors', updated);
  };

  const removeCompetitor = (id) => {
    if (marketData.competitors.length > 1) {
      const updated = marketData.competitors.filter((comp) => comp.id !== id);
      updateField('competitors', updated);
    }
  };

  const addListItem = (field, item) => {
    updateField(field, [...(marketData[field] || []), item]);
  };

  const removeListItem = (field, index) => {
    const updated = (marketData[field] || []).filter((_, i) => i !== index);
    updateField(field, updated);
  };

  const addCompetitorItem = (competitorId, field, item) => {
    const competitor = marketData.competitors.find((c) => c.id === competitorId);
    if (competitor) {
      const updated = [...(competitor[field] || []), item];
      updateCompetitor(competitorId, field, updated);
    }
  };

  const removeCompetitorItem = (competitorId, field, index) => {
    const competitor = marketData.competitors.find((c) => c.id === competitorId);
    if (competitor) {
      const updated = (competitor[field] || []).filter((_, i) => i !== index);
      updateCompetitor(competitorId, field, updated);
    }
  };

  return (
    <div className="market-analysis">
      <h3 className="ma-title">
        <span className="title-icon">📊</span>
        Market Analysis
      </h3>

      {/* Industry Overview */}
      <div className="ma-section">
        <h4 className="section-title">Industry Overview</h4>

        <div className="form-group">
          <label className="form-label">Industry</label>
          {readOnly ? (
            <p className="form-text">{marketData.industry || 'Not specified'}</p>
          ) : (
            <input
              type="text"
              className="form-control"
              value={marketData.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              placeholder="e.g., Technology, Healthcare, Retail"
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Market</label>
          {readOnly ? (
            <p className="form-text">{marketData.targetMarket || 'Not specified'}</p>
          ) : (
            <textarea
              className="form-control"
              rows={2}
              value={marketData.targetMarket}
              onChange={(e) => updateField('targetMarket', e.target.value)}
              placeholder="Describe your primary target market"
            />
          )}
        </div>
      </div>

      {/* Market Size */}
      <div className="ma-section">
        <h4 className="section-title">Market Size</h4>

        <div className="market-size-grid">
          <div className="size-card tam">
            <h5 className="size-title">TAM</h5>
            <p className="size-desc">Total Available Market</p>
            {readOnly ? (
              <p className="size-value">{marketData.marketSize.tam || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={marketData.marketSize.tam}
                onChange={(e) => updateNestedField('marketSize', 'tam', e.target.value)}
                placeholder="$0"
              />
            )}
          </div>

          <div className="size-card sam">
            <h5 className="size-title">SAM</h5>
            <p className="size-desc">Serviceable Available Market</p>
            {readOnly ? (
              <p className="size-value">{marketData.marketSize.sam || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={marketData.marketSize.sam}
                onChange={(e) => updateNestedField('marketSize', 'sam', e.target.value)}
                placeholder="$0"
              />
            )}
          </div>

          <div className="size-card som">
            <h5 className="size-title">SOM</h5>
            <p className="size-desc">Serviceable Obtainable Market</p>
            {readOnly ? (
              <p className="size-value">{marketData.marketSize.som || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={marketData.marketSize.som}
                onChange={(e) => updateNestedField('marketSize', 'som', e.target.value)}
                placeholder="$0"
              />
            )}
          </div>
        </div>
      </div>

      {/* Market Trends */}
      <div className="ma-section">
        <div className="section-header">
          <h4 className="section-title">Market Trends</h4>
          {!readOnly && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                const input = prompt('Enter market trend:');
                if (input) addListItem('trends', input);
              }}
            >
              + Add Trend
            </button>
          )}
        </div>

        {readOnly ? (
          <div className="trends-list">
            {marketData.trends?.map((trend, index) => (
              <div key={index} className="trend-item">
                <span className="trend-icon">📈</span>
                <span>{trend}</span>
              </div>
            ))}
            {(!marketData.trends || marketData.trends.length === 0) && (
              <p className="form-text">No trends specified</p>
            )}
          </div>
        ) : (
          <div className="trends-list">
            {marketData.trends?.map((trend, index) => (
              <div key={index} className="trend-item">
                <span className="trend-icon">📈</span>
                <span>{trend}</span>
                <button
                  className="btn-remove"
                  onClick={() => removeListItem('trends', index)}
                  aria-label="Remove trend"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competitor Analysis */}
      <div className="ma-section">
        <div className="section-header">
          <h4 className="section-title">Competitor Analysis</h4>
          {!readOnly && (
            <button className="btn btn-outline-primary btn-sm" onClick={addCompetitor}>
              + Add Competitor
            </button>
          )}
        </div>

        <div className="competitors-grid">
          {marketData.competitors.map((competitor, index) => (
            <div key={competitor.id} className="competitor-card">
              <div className="competitor-header">
                <h5 className="competitor-title">
                  Competitor {index + 1}
                  {!readOnly && marketData.competitors.length > 1 && (
                    <button
                      className="btn-remove"
                      onClick={() => removeCompetitor(competitor.id)}
                      aria-label="Remove competitor"
                    >
                      ×
                    </button>
                  )}
                </h5>
              </div>

              <div className="competitor-content">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  {readOnly ? (
                    <p className="form-text">{competitor.name || 'Not specified'}</p>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={competitor.name}
                      onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                      placeholder="Competitor name"
                    />
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Market Share</label>
                    {readOnly ? (
                      <p className="form-text">{competitor.marketShare || 'Not specified'}</p>
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        value={competitor.marketShare}
                        onChange={(e) =>
                          updateCompetitor(competitor.id, 'marketShare', e.target.value)
                        }
                        placeholder="e.g., 25%"
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pricing</label>
                    {readOnly ? (
                      <p className="form-text">{competitor.pricing || 'Not specified'}</p>
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        value={competitor.pricing}
                        onChange={(e) => updateCompetitor(competitor.id, 'pricing', e.target.value)}
                        placeholder="e.g., Premium, Budget"
                      />
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Differentiator</label>
                  {readOnly ? (
                    <p className="form-text">{competitor.differentiator || 'Not specified'}</p>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={competitor.differentiator}
                      onChange={(e) =>
                        updateCompetitor(competitor.id, 'differentiator', e.target.value)
                      }
                      placeholder="What makes them unique?"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Strengths</label>
                  {readOnly ? (
                    <div className="tags-list">
                      {competitor.strengths?.map((strength, i) => (
                        <span key={i} className="tag tag-success">
                          {strength}
                        </span>
                      ))}
                      {(!competitor.strengths || competitor.strengths.length === 0) && (
                        <p className="form-text">None specified</p>
                      )}
                    </div>
                  ) : (
                    <div className="tags-input">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add strength and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            addCompetitorItem(competitor.id, 'strengths', e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <div className="tags-list">
                        {competitor.strengths?.map((strength, i) => (
                          <span key={i} className="tag tag-success">
                            {strength}
                            <button
                              className="tag-remove"
                              onClick={() => removeCompetitorItem(competitor.id, 'strengths', i)}
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
                  <label className="form-label">Weaknesses</label>
                  {readOnly ? (
                    <div className="tags-list">
                      {competitor.weaknesses?.map((weakness, i) => (
                        <span key={i} className="tag tag-danger">
                          {weakness}
                        </span>
                      ))}
                      {(!competitor.weaknesses || competitor.weaknesses.length === 0) && (
                        <p className="form-text">None specified</p>
                      )}
                    </div>
                  ) : (
                    <div className="tags-input">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add weakness and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            addCompetitorItem(competitor.id, 'weaknesses', e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <div className="tags-list">
                        {competitor.weaknesses?.map((weakness, i) => (
                          <span key={i} className="tag tag-danger">
                            {weakness}
                            <button
                              className="tag-remove"
                              onClick={() => removeCompetitorItem(competitor.id, 'weaknesses', i)}
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
            </div>
          ))}
        </div>
      </div>

      {/* Market Needs */}
      <div className="ma-section">
        <div className="section-header">
          <h4 className="section-title">Market Needs</h4>
          {!readOnly && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                const input = prompt('Enter market need:');
                if (input) addListItem('marketNeeds', input);
              }}
            >
              + Add Need
            </button>
          )}
        </div>

        {readOnly ? (
          <div className="needs-list">
            {marketData.marketNeeds?.map((need, index) => (
              <div key={index} className="need-item">
                <span className="need-icon">🎯</span>
                <span>{need}</span>
              </div>
            ))}
            {(!marketData.marketNeeds || marketData.marketNeeds.length === 0) && (
              <p className="form-text">No market needs specified</p>
            )}
          </div>
        ) : (
          <div className="needs-list">
            {marketData.marketNeeds?.map((need, index) => (
              <div key={index} className="need-item">
                <span className="need-icon">🎯</span>
                <span>{need}</span>
                <button
                  className="btn-remove"
                  onClick={() => removeListItem('marketNeeds', index)}
                  aria-label="Remove need"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barriers to Entry */}
      <div className="ma-section">
        <div className="section-header">
          <h4 className="section-title">Barriers to Entry</h4>
          {!readOnly && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                const input = prompt('Enter barrier to entry:');
                if (input) addListItem('barriers', input);
              }}
            >
              + Add Barrier
            </button>
          )}
        </div>

        {readOnly ? (
          <div className="barriers-list">
            {marketData.barriers?.map((barrier, index) => (
              <div key={index} className="barrier-item">
                <span className="barrier-icon">🚧</span>
                <span>{barrier}</span>
              </div>
            ))}
            {(!marketData.barriers || marketData.barriers.length === 0) && (
              <p className="form-text">No barriers specified</p>
            )}
          </div>
        ) : (
          <div className="barriers-list">
            {marketData.barriers?.map((barrier, index) => (
              <div key={index} className="barrier-item">
                <span className="barrier-icon">🚧</span>
                <span>{barrier}</span>
                <button
                  className="btn-remove"
                  onClick={() => removeListItem('barriers', index)}
                  aria-label="Remove barrier"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regulations */}
      <div className="ma-section">
        <div className="section-header">
          <h4 className="section-title">Regulatory Considerations</h4>
          {!readOnly && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                const input = prompt('Enter regulation:');
                if (input) addListItem('regulations', input);
              }}
            >
              + Add Regulation
            </button>
          )}
        </div>

        {readOnly ? (
          <div className="regulations-list">
            {marketData.regulations?.map((regulation, index) => (
              <div key={index} className="regulation-item">
                <span className="regulation-icon">⚖️</span>
                <span>{regulation}</span>
              </div>
            ))}
            {(!marketData.regulations || marketData.regulations.length === 0) && (
              <p className="form-text">No regulations specified</p>
            )}
          </div>
        ) : (
          <div className="regulations-list">
            {marketData.regulations?.map((regulation, index) => (
              <div key={index} className="regulation-item">
                <span className="regulation-icon">⚖️</span>
                <span>{regulation}</span>
                <button
                  className="btn-remove"
                  onClick={() => removeListItem('regulations', index)}
                  aria-label="Remove regulation"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .market-analysis {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
        }

        .ma-title {
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

        .ma-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .ma-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .market-size-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .size-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .size-card.tam {
          border-top: 4px solid #3b82f6;
        }

        .size-card.sam {
          border-top: 4px solid #10b981;
        }

        .size-card.som {
          border-top: 4px solid #f59e0b;
        }

        .size-title {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .size-desc {
          margin: 0 0 12px 0;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .size-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .competitors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .competitor-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }

        .competitor-header {
          background: #e9ecef;
          padding: 12px 16px;
          border-bottom: 1px solid #dee2e6;
        }

        .competitor-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #495057;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .competitor-content {
          padding: 16px;
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
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .tag-success {
          background: #d4edda;
          color: #155724;
        }

        .tag-danger {
          background: #f8d7da;
          color: #721c24;
        }

        .tag-remove {
          background: none;
          border: none;
          color: currentColor;
          opacity: 0.5;
          font-size: 1rem;
          cursor: pointer;
          padding: 0 2px;
        }

        .tag-remove:hover {
          opacity: 1;
        }

        .trend-item,
        .need-item,
        .barrier-item,
        .regulation-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .trend-icon {
          color: #3b82f6;
        }
        .need-icon {
          color: #10b981;
        }
        .barrier-icon {
          color: #f59e0b;
        }
        .regulation-icon {
          color: #8b5cf6;
        }

        @media (max-width: 768px) {
          .market-size-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .competitors-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

MarketAnalysis.propTypes = {
  initialData: PropTypes.shape({
    industry: PropTypes.string,
    targetMarket: PropTypes.string,
    marketSize: PropTypes.shape({
      tam: PropTypes.string,
      sam: PropTypes.string,
      som: PropTypes.string,
    }),
    trends: PropTypes.arrayOf(PropTypes.string),
    competitors: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        strengths: PropTypes.arrayOf(PropTypes.string),
        weaknesses: PropTypes.arrayOf(PropTypes.string),
        marketShare: PropTypes.string,
        pricing: PropTypes.string,
        differentiator: PropTypes.string,
      })
    ),
    marketNeeds: PropTypes.arrayOf(PropTypes.string),
    barriers: PropTypes.arrayOf(PropTypes.string),
    regulations: PropTypes.arrayOf(PropTypes.string),
  }),
  readOnly: PropTypes.bool,
  onUpdate: PropTypes.func,
};

export default MarketAnalysis;
