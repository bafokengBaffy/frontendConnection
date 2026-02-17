/* eslint-disable react/no-unknown-property */
// src/components/charts/CompanyStatsChart.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from "chart.jsx";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CompanyStatsChart = ({ data = {} }) => {
  // Default data structure
  const defaultData = {
    new: data.new || 0,
    reviewed: data.reviewed || 0,
    interview: data.interview || 0,
    hired: data.hired || 0
  };

  const chartData = {
    labels: ['Applied', 'Reviewed', 'Interview', 'Hired'],
    datasets: [
      {
        data: [
          defaultData.new,
          defaultData.reviewed,
          defaultData.interview,
          defaultData.hired
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)', // amber
          'rgba(59, 130, 246, 0.8)',  // blue
          'rgba(139, 92, 246, 0.8)',  // purple
          'rgba(16, 185, 129, 0.8)'   // green
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 15
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#4B5563'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: 'Application Pipeline',
        font: {
          size: 16,
          weight: '600',
          family: "'Inter', sans-serif"
        },
        color: '#1F2937',
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    cutout: '70%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  // Calculate total for display
  const totalApplications = Object.values(defaultData).reduce((sum, value) => sum + value, 0);

  return (
    <div className="company-stats-chart">
      <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
      
      {/* Stats summary */}
      <div className="chart-stats-summary mt-4">
        <div className="row text-center">
          <div className="col-3">
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#F59E0B' }}>{defaultData.new}</div>
              <div className="stat-label">Applied</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#3B82F6' }}>{defaultData.reviewed}</div>
              <div className="stat-label">Reviewed</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#8B5CF6' }}>{defaultData.interview}</div>
              <div className="stat-label">Interview</div>
            </div>
          </div>
          <div className="col-3">
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#10B981' }}>{defaultData.hired}</div>
              <div className="stat-label">Hired</div>
            </div>
          </div>
        </div>
        <div className="total-applications text-center mt-3">
          <div className="total-badge">
            Total Applications: <strong>{totalApplications}</strong>
          </div>
        </div>
      </div>
      
      {/* Chart styles */}
      <style>{`
        .company-stats-chart {
          padding: 1rem;
        }
        
        .chart-stats-summary {
          padding: 1rem;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }
        
        .stat-item {
          padding: 0.5rem;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #64748B;
          font-weight: 500;
        }
        
        .total-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          font-size: 0.9rem;
          color: #4B5563;
        }
        
        .total-badge strong {
          color: #1F2937;
          font-size: 1.1rem;
        }
        
        @media (max-width: 768px) {
          .stat-value {
            font-size: 1.25rem;
          }
          
          .stat-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyStatsChart;