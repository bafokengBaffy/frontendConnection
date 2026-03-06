import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  CreditCard,
  Banknote,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart2,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { mentorService } from '../../services/mentorService';
import { useAuth } from '../../hooks/useAuth';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './MentorStyles.css';

const MentorEarnings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    transactions: [],
    summary: { total: 0, completed: 0, pending: 0 },
  });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState('bank');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  useEffect(() => {
    if (user) {
      loadEarnings();
    }
  }, [user, selectedPeriod]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual service call
      const mockEarnings = {
        transactions: [
          {
            id: '1',
            sessionId: 's1',
            studentName: 'John Doe',
            amount: 150,
            status: 'completed',
            date: new Date('2026-03-15'),
            type: 'session',
            platformFee: 15,
            netAmount: 135,
          },
          {
            id: '2',
            sessionId: 's2',
            studentName: 'Sarah Smith',
            amount: 120,
            status: 'completed',
            date: new Date('2026-03-10'),
            type: 'session',
            platformFee: 12,
            netAmount: 108,
          },
          {
            id: '3',
            sessionId: 's3',
            studentName: 'Mike Johnson',
            amount: 200,
            status: 'pending',
            date: new Date('2026-03-05'),
            type: 'session',
            platformFee: 20,
            netAmount: 180,
          },
          {
            id: '4',
            sessionId: 's4',
            studentName: 'Emily Brown',
            amount: 175,
            status: 'completed',
            date: new Date('2026-02-28'),
            type: 'session',
            platformFee: 17.5,
            netAmount: 157.5,
          },
          {
            id: '5',
            sessionId: 's5',
            studentName: 'David Wilson',
            amount: 90,
            status: 'refunded',
            date: new Date('2026-02-25'),
            type: 'session',
            platformFee: 9,
            netAmount: 81,
          },
        ],
        summary: {
          total: 735,
          completed: 555,
          pending: 180,
        },
      };

      setEarnings(mockEarnings);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Earnings',
        data: [450, 520, 480, 735],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: ['Completed', 'Pending', 'Refunded'],
    datasets: [
      {
        data: [555, 180, 81],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className="status-completed" />;
      case 'pending':
        return <Clock size={14} className="status-pending" />;
      case 'refunded':
        return <XCircle size={14} className="status-refunded" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handlePayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) > earnings.summary.completed) {
      alert('Invalid amount');
      return;
    }

    try {
      // Process payout
      console.log('Processing payout:', { amount: payoutAmount, method: selectedPayoutMethod });
      setShowPayoutModal(false);
      setPayoutAmount('');
      // Show success message
    } catch (error) {
      console.error('Error processing payout:', error);
    }
  };

  if (loading) {
    return (
      <div className="mentor-loading">
        <div className="spinner"></div>
        <p>Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="mentor-earnings">
      {/* Header */}
      <motion.div
        className="earnings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>Earnings</h1>
          <p>Track your income and payouts</p>
        </div>
        <button className="payout-btn" onClick={() => setShowPayoutModal(true)}>
          <Wallet size={16} />
          Request Payout
        </button>
      </motion.div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <motion.div
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <DollarSign color="#10B981" />
          </div>
          <div className="card-content">
            <h3>Total Earnings</h3>
            <p className="value">${earnings.summary.total}</p>
            <span className="trend positive">
              <TrendingUp size={14} />
              +12% from last month
            </span>
          </div>
        </motion.div>

        <motion.div
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock color="#F59E0B" />
          </div>
          <div className="card-content">
            <h3>Available Balance</h3>
            <p className="value">${earnings.summary.completed}</p>
            <span className="trend">Ready for payout</span>
          </div>
        </motion.div>

        <motion.div
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <CreditCard color="#6366F1" />
          </div>
          <div className="card-content">
            <h3>Pending</h3>
            <p className="value">${earnings.summary.pending}</p>
            <span className="trend">Will be available in 7 days</span>
          </div>
        </motion.div>

        <motion.div
          className="summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <BarChart2 color="#EF4444" />
          </div>
          <div className="card-content">
            <h3>Total Sessions</h3>
            <p className="value">{earnings.transactions.length}</p>
            <span className="trend positive">
              <TrendingUp size={14} />
              Avg. ${(earnings.summary.total / earnings.transactions.length).toFixed(2)} per session
            </span>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="chart-header">
            <h3>Earnings Overview</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="chart-container">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: 'rgba(0,0,0,0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Earnings Distribution</h3>
          <div className="doughnut-container">
            <Doughnut
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        className="transactions-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="section-header">
          <h2>Transaction History</h2>
          <div className="header-actions">
            <button className="filter-btn">
              <Filter size={16} />
              Filter
            </button>
            <button className="download-btn">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="transactions-list">
          <div className="transactions-header">
            <div className="col-date">Date</div>
            <div className="col-student">Student</div>
            <div className="col-amount">Amount</div>
            <div className="col-fee">Fee</div>
            <div className="col-net">Net</div>
            <div className="col-status">Status</div>
          </div>

          {earnings.transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              className="transaction-row"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="col-date">{transaction.date.toLocaleDateString()}</div>
              <div className="col-student">{transaction.studentName}</div>
              <div className="col-amount">
                <span className="amount">${transaction.amount}</span>
              </div>
              <div className="col-fee">
                <span className="fee">${transaction.platformFee}</span>
              </div>
              <div className="col-net">
                <span className="net">${transaction.netAmount}</span>
              </div>
              <div className="col-status">
                <span className={`status-badge ${transaction.status}`}>
                  {getStatusIcon(transaction.status)}
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <motion.div
          className="payout-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPayoutModal(false)}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Request Payout</h2>
              <button className="close-btn" onClick={() => setShowPayoutModal(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="balance-info">
                <p>Available Balance</p>
                <h3>${earnings.summary.completed}</h3>
              </div>

              <div className="form-group">
                <label>Amount to Withdraw</label>
                <div className="amount-input">
                  <span>$</span>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Enter amount"
                    max={earnings.summary.completed}
                  />
                </div>
                <button
                  className="max-btn"
                  onClick={() => setPayoutAmount(earnings.summary.completed.toString())}
                >
                  Max
                </button>
              </div>

              <div className="form-group">
                <label>Payout Method</label>
                <div className="method-options">
                  <label className="method-option">
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="bank"
                      checked={selectedPayoutMethod === 'bank'}
                      onChange={(e) => setSelectedPayoutMethod(e.target.value)}
                    />
                    <Banknote size={20} />
                    <div>
                      <strong>Bank Transfer</strong>
                      <small>2-3 business days</small>
                    </div>
                  </label>

                  <label className="method-option">
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="paypal"
                      checked={selectedPayoutMethod === 'paypal'}
                      onChange={(e) => setSelectedPayoutMethod(e.target.value)}
                    />
                    <CreditCard size={20} />
                    <div>
                      <strong>PayPal</strong>
                      <small>Instant</small>
                    </div>
                  </label>

                  <label className="method-option">
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="wise"
                      checked={selectedPayoutMethod === 'wise'}
                      onChange={(e) => setSelectedPayoutMethod(e.target.value)}
                    />
                    <Wallet size={20} />
                    <div>
                      <strong>Wise</strong>
                      <small>1-2 business days</small>
                    </div>
                  </label>
                </div>
              </div>

              <div className="summary">
                <div className="summary-row">
                  <span>Amount</span>
                  <span>${payoutAmount || '0'}</span>
                </div>
                <div className="summary-row">
                  <span>Fee</span>
                  <span>$0</span>
                </div>
                <div className="summary-row total">
                  <span>You'll receive</span>
                  <span>${payoutAmount || '0'}</span>
                </div>
              </div>

              <button
                className="confirm-btn"
                onClick={handlePayout}
                disabled={!payoutAmount || parseFloat(payoutAmount) > earnings.summary.completed}
              >
                Confirm Payout
              </button>

              <p className="note">
                <AlertCircle size={14} />
                Payouts are processed within 2-3 business days
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MentorEarnings;
