/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/youth/business/FinancialProjections.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * FinancialProjections Component
 * Helps businesses create financial forecasts and projections
 */
const FinancialProjections = ({ initialData = {}, readOnly = false, onUpdate }) => {
  const [projections, setProjections] = useState({
    timeframe: initialData.timeframe || 3, // years
    currency: initialData.currency || 'USD',

    revenue: initialData.revenue || {
      year1: '',
      year2: '',
      year3: '',
      year4: '',
      year5: '',
    },

    expenses: initialData.expenses || {
      fixed: [
        { id: '1', name: 'Rent', amount: '' },
        { id: '2', name: 'Salaries', amount: '' },
        { id: '3', name: 'Insurance', amount: '' },
      ],
      variable: [
        { id: '4', name: 'Marketing', amount: '' },
        { id: '5', name: 'Materials', amount: '' },
        { id: '6', name: 'Shipping', amount: '' },
      ],
    },

    profitLoss: initialData.profitLoss || {
      year1: '',
      year2: '',
      year3: '',
      year4: '',
      year5: '',
    },

    cashFlow: initialData.cashFlow || {
      startingCash: '',
      investments: '',
      loans: '',
      runway: '',
    },

    metrics: initialData.metrics || {
      grossMargin: '',
      netMargin: '',
      breakEven: '',
      roi: '',
      paybackPeriod: '',
    },

    assumptions: initialData.assumptions || [],
  });

  const updateField = (field, value) => {
    const updated = { ...projections, [field]: value };
    setProjections(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const updateNestedField = (parent, field, value) => {
    const updated = {
      ...projections,
      [parent]: {
        ...projections[parent],
        [field]: value,
      },
    };
    setProjections(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const addExpense = (type) => {
    const newExpense = {
      id: Date.now().toString(),
      name: '',
      amount: '',
    };

    const updated = {
      ...projections,
      expenses: {
        ...projections.expenses,
        [type]: [...projections.expenses[type], newExpense],
      },
    };
    setProjections(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const updateExpense = (type, id, field, value) => {
    const updated = {
      ...projections,
      expenses: {
        ...projections.expenses,
        [type]: projections.expenses[type].map((exp) => {
          if (exp.id === id) {
            return { ...exp, [field]: value };
          }
          return exp;
        }),
      },
    };
    setProjections(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const removeExpense = (type, id) => {
    if (projections.expenses[type].length > 1) {
      const updated = {
        ...projections,
        expenses: {
          ...projections.expenses,
          [type]: projections.expenses[type].filter((exp) => exp.id !== id),
        },
      };
      setProjections(updated);
      if (onUpdate) {
        onUpdate(updated);
      }
    }
  };

  const addAssumption = () => {
    const input = prompt('Enter financial assumption:');
    if (input) {
      const updated = {
        ...projections,
        assumptions: [...projections.assumptions, input],
      };
      setProjections(updated);
      if (onUpdate) {
        onUpdate(updated);
      }
    }
  };

  const removeAssumption = (index) => {
    const updated = {
      ...projections,
      assumptions: projections.assumptions.filter((_, i) => i !== index),
    };
    setProjections(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  // Calculate totals
  const calculateTotalFixedExpenses = () => {
    return projections.expenses.fixed.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  };

  const calculateTotalVariableExpenses = () => {
    return projections.expenses.variable.reduce(
      (sum, exp) => sum + (parseFloat(exp.amount) || 0),
      0
    );
  };

  const calculateTotalExpenses = () => {
    return calculateTotalFixedExpenses() + calculateTotalVariableExpenses();
  };

  const calculateProfitLoss = (year) => {
    const revenue = parseFloat(projections.revenue[year]) || 0;
    const totalExpenses = calculateTotalExpenses();
    return revenue - totalExpenses;
  };

  // Update profit/loss when revenue or expenses change
  useEffect(() => {
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    const updatedPL = {};

    years.forEach((year) => {
      updatedPL[year] = calculateProfitLoss(year).toString();
    });

    setProjections((prev) => ({
      ...prev,
      profitLoss: updatedPL,
    }));
  }, [projections.revenue, projections.expenses, calculateProfitLoss]);

  return (
    <div className="financial-projections">
      <h3 className="fp-title">
        <span className="title-icon">📈</span>
        Financial Projections
      </h3>

      {/* Basic Settings */}
      <div className="fp-section">
        <h4 className="section-title">Basic Settings</h4>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Timeframe (years)</label>
            {readOnly ? (
              <p className="form-text">{projections.timeframe} years</p>
            ) : (
              <select
                className="form-control"
                value={projections.timeframe}
                onChange={(e) => updateField('timeframe', parseInt(e.target.value))}
              >
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Currency</label>
            {readOnly ? (
              <p className="form-text">{projections.currency}</p>
            ) : (
              <select
                className="form-control"
                value={projections.currency}
                onChange={(e) => updateField('currency', e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="ZAR">ZAR (R)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="fp-section">
        <h4 className="section-title">Revenue Projections</h4>

        <div className="revenue-grid">
          {['year1', 'year2', 'year3', 'year4', 'year5']
            .slice(0, projections.timeframe)
            .map((year, index) => (
              <div key={year} className="revenue-card">
                <h5 className="revenue-year">Year {index + 1}</h5>
                {readOnly ? (
                  <p className="revenue-amount">
                    {projections.revenue[year]
                      ? `${projections.currency} ${parseFloat(projections.revenue[year]).toLocaleString()}`
                      : 'Not specified'}
                  </p>
                ) : (
                  <input
                    type="number"
                    className="form-control"
                    value={projections.revenue[year]}
                    onChange={(e) => updateNestedField('revenue', year, e.target.value)}
                    placeholder={`Year ${index + 1} revenue`}
                    min="0"
                    step="1000"
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Expenses */}
      <div className="fp-section">
        <h4 className="section-title">Expenses</h4>

        {/* Fixed Expenses */}
        <div className="expense-category">
          <div className="category-header">
            <h5 className="category-title">Fixed Expenses</h5>
            {!readOnly && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => addExpense('fixed')}
              >
                + Add Fixed Expense
              </button>
            )}
          </div>

          <div className="expense-list">
            {projections.expenses.fixed.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-name">
                  {readOnly ? (
                    <span>{expense.name || 'Unnamed'}</span>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={expense.name}
                      onChange={(e) => updateExpense('fixed', expense.id, 'name', e.target.value)}
                      placeholder="Expense name"
                    />
                  )}
                </div>
                <div className="expense-amount">
                  {readOnly ? (
                    <span>
                      {expense.amount
                        ? `${projections.currency} ${parseFloat(expense.amount).toLocaleString()}`
                        : '-'}
                    </span>
                  ) : (
                    <>
                      <input
                        type="number"
                        className="form-control"
                        value={expense.amount}
                        onChange={(e) =>
                          updateExpense('fixed', expense.id, 'amount', e.target.value)
                        }
                        placeholder="Amount"
                        min="0"
                        step="100"
                      />
                      {projections.expenses.fixed.length > 1 && (
                        <button
                          className="btn-remove"
                          onClick={() => removeExpense('fixed', expense.id)}
                          aria-label="Remove expense"
                        >
                          ×
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="expense-total">
            <span>Total Fixed Expenses:</span>
            <strong>
              {projections.currency} {calculateTotalFixedExpenses().toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Variable Expenses */}
        <div className="expense-category">
          <div className="category-header">
            <h5 className="category-title">Variable Expenses</h5>
            {!readOnly && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => addExpense('variable')}
              >
                + Add Variable Expense
              </button>
            )}
          </div>

          <div className="expense-list">
            {projections.expenses.variable.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-name">
                  {readOnly ? (
                    <span>{expense.name || 'Unnamed'}</span>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={expense.name}
                      onChange={(e) =>
                        updateExpense('variable', expense.id, 'name', e.target.value)
                      }
                      placeholder="Expense name"
                    />
                  )}
                </div>
                <div className="expense-amount">
                  {readOnly ? (
                    <span>
                      {expense.amount
                        ? `${projections.currency} ${parseFloat(expense.amount).toLocaleString()}`
                        : '-'}
                    </span>
                  ) : (
                    <>
                      <input
                        type="number"
                        className="form-control"
                        value={expense.amount}
                        onChange={(e) =>
                          updateExpense('variable', expense.id, 'amount', e.target.value)
                        }
                        placeholder="Amount"
                        min="0"
                        step="100"
                      />
                      {projections.expenses.variable.length > 1 && (
                        <button
                          className="btn-remove"
                          onClick={() => removeExpense('variable', expense.id)}
                          aria-label="Remove expense"
                        >
                          ×
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="expense-total">
            <span>Total Variable Expenses:</span>
            <strong>
              {projections.currency} {calculateTotalVariableExpenses().toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="expense-grand-total">
          <span>Total Expenses (Yearly):</span>
          <strong>
            {projections.currency} {calculateTotalExpenses().toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Profit & Loss Summary */}
      <div className="fp-section">
        <h4 className="section-title">Profit & Loss Summary</h4>

        <div className="pl-grid">
          {['year1', 'year2', 'year3', 'year4', 'year5']
            .slice(0, projections.timeframe)
            .map((year, index) => {
              const profit = parseFloat(projections.profitLoss[year]) || 0;
              return (
                <div key={year} className={`pl-card ${profit >= 0 ? 'positive' : 'negative'}`}>
                  <h5 className="pl-year">Year {index + 1}</h5>
                  <p className="pl-amount">
                    {profit >= 0 ? '+' : ''}
                    {projections.currency} {Math.abs(profit).toLocaleString()}
                  </p>
                  <p className="pl-label">{profit >= 0 ? 'Profit' : 'Loss'}</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Cash Flow */}
      <div className="fp-section">
        <h4 className="section-title">Cash Flow Analysis</h4>

        <div className="cashflow-grid">
          <div className="cashflow-card">
            <h5 className="cashflow-label">Starting Cash</h5>
            {readOnly ? (
              <p className="cashflow-value">
                {projections.cashFlow.startingCash || 'Not specified'}
              </p>
            ) : (
              <input
                type="number"
                className="form-control"
                value={projections.cashFlow.startingCash}
                onChange={(e) => updateNestedField('cashFlow', 'startingCash', e.target.value)}
                placeholder="0"
                min="0"
                step="1000"
              />
            )}
          </div>

          <div className="cashflow-card">
            <h5 className="cashflow-label">Expected Investments</h5>
            {readOnly ? (
              <p className="cashflow-value">
                {projections.cashFlow.investments || 'Not specified'}
              </p>
            ) : (
              <input
                type="number"
                className="form-control"
                value={projections.cashFlow.investments}
                onChange={(e) => updateNestedField('cashFlow', 'investments', e.target.value)}
                placeholder="0"
                min="0"
                step="1000"
              />
            )}
          </div>

          <div className="cashflow-card">
            <h5 className="cashflow-label">Loans</h5>
            {readOnly ? (
              <p className="cashflow-value">{projections.cashFlow.loans || 'Not specified'}</p>
            ) : (
              <input
                type="number"
                className="form-control"
                value={projections.cashFlow.loans}
                onChange={(e) => updateNestedField('cashFlow', 'loans', e.target.value)}
                placeholder="0"
                min="0"
                step="1000"
              />
            )}
          </div>

          <div className="cashflow-card">
            <h5 className="cashflow-label">Runway (months)</h5>
            {readOnly ? (
              <p className="cashflow-value">{projections.cashFlow.runway || 'Not specified'}</p>
            ) : (
              <input
                type="number"
                className="form-control"
                value={projections.cashFlow.runway}
                onChange={(e) => updateNestedField('cashFlow', 'runway', e.target.value)}
                placeholder="12"
                min="0"
              />
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="fp-section">
        <h4 className="section-title">Key Financial Metrics</h4>

        <div className="metrics-grid">
          <div className="metric-card">
            <h5 className="metric-label">Gross Margin</h5>
            {readOnly ? (
              <p className="metric-value">{projections.metrics.grossMargin || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={projections.metrics.grossMargin}
                onChange={(e) => updateNestedField('metrics', 'grossMargin', e.target.value)}
                placeholder="e.g., 60%"
              />
            )}
          </div>

          <div className="metric-card">
            <h5 className="metric-label">Net Margin</h5>
            {readOnly ? (
              <p className="metric-value">{projections.metrics.netMargin || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={projections.metrics.netMargin}
                onChange={(e) => updateNestedField('metrics', 'netMargin', e.target.value)}
                placeholder="e.g., 20%"
              />
            )}
          </div>

          <div className="metric-card">
            <h5 className="metric-label">Break-even Point</h5>
            {readOnly ? (
              <p className="metric-value">{projections.metrics.breakEven || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={projections.metrics.breakEven}
                onChange={(e) => updateNestedField('metrics', 'breakEven', e.target.value)}
                placeholder="e.g., 12 months"
              />
            )}
          </div>

          <div className="metric-card">
            <h5 className="metric-label">ROI</h5>
            {readOnly ? (
              <p className="metric-value">{projections.metrics.roi || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={projections.metrics.roi}
                onChange={(e) => updateNestedField('metrics', 'roi', e.target.value)}
                placeholder="e.g., 25%"
              />
            )}
          </div>

          <div className="metric-card">
            <h5 className="metric-label">Payback Period</h5>
            {readOnly ? (
              <p className="metric-value">{projections.metrics.paybackPeriod || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                className="form-control"
                value={projections.metrics.paybackPeriod}
                onChange={(e) => updateNestedField('metrics', 'paybackPeriod', e.target.value)}
                placeholder="e.g., 18 months"
              />
            )}
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="fp-section">
        <div className="section-header">
          <h4 className="section-title">Key Assumptions</h4>
          {!readOnly && (
            <button className="btn btn-outline-primary btn-sm" onClick={addAssumption}>
              + Add Assumption
            </button>
          )}
        </div>

        {readOnly ? (
          <div className="assumptions-list">
            {projections.assumptions.map((assumption, index) => (
              <div key={index} className="assumption-item">
                <span className="assumption-icon">📌</span>
                <span>{assumption}</span>
              </div>
            ))}
            {projections.assumptions.length === 0 && (
              <p className="form-text">No assumptions specified</p>
            )}
          </div>
        ) : (
          <div className="assumptions-list">
            {projections.assumptions.map((assumption, index) => (
              <div key={index} className="assumption-item">
                <span className="assumption-icon">📌</span>
                <span>{assumption}</span>
                <button
                  className="btn-remove"
                  onClick={() => removeAssumption(index)}
                  aria-label="Remove assumption"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .financial-projections {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
        }

        .fp-title {
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

        .fp-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .fp-section:last-child {
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
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .form-group {
          margin-bottom: 16px;
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

        .revenue-grid,
        .pl-grid,
        .cashflow-grid,
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .revenue-card,
        .pl-card,
        .cashflow-card,
        .metric-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
        }

        .pl-card.positive {
          background: #d4edda;
          border-left: 4px solid #28a745;
        }

        .pl-card.negative {
          background: #f8d7da;
          border-left: 4px solid #dc3545;
        }

        .revenue-year,
        .pl-year,
        .cashflow-label,
        .metric-label {
          margin: 0 0 8px 0;
          font-size: 0.95rem;
          font-weight: 500;
          color: #495057;
        }

        .revenue-amount,
        .pl-amount,
        .cashflow-value,
        .metric-value {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .pl-label {
          margin: 4px 0 0 0;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .expense-category {
          margin-bottom: 20px;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .category-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          color: #6c757d;
        }

        .expense-list {
          margin-bottom: 12px;
        }

        .expense-item {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }

        .expense-name {
          flex: 2;
        }

        .expense-amount {
          flex: 1;
          display: flex;
          gap: 8px;
        }

        .expense-total,
        .expense-grand-total {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-top: 1px solid #dee2e6;
          font-weight: 500;
        }

        .expense-grand-total {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px solid #adb5bd;
          font-size: 1.1rem;
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

        .assumptions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .assumption-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .assumption-icon {
          color: #f59e0b;
        }

        @media (max-width: 768px) {
          .revenue-grid,
          .pl-grid,
          .cashflow-grid,
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .expense-item {
            flex-direction: column;
            gap: 4px;
          }

          .expense-amount {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

FinancialProjections.propTypes = {
  initialData: PropTypes.shape({
    timeframe: PropTypes.number,
    currency: PropTypes.string,
    revenue: PropTypes.object,
    expenses: PropTypes.object,
    profitLoss: PropTypes.object,
    cashFlow: PropTypes.object,
    metrics: PropTypes.object,
    assumptions: PropTypes.arrayOf(PropTypes.string),
  }),
  readOnly: PropTypes.bool,
  onUpdate: PropTypes.func,
};

export default FinancialProjections;
