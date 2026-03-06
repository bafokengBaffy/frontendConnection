// components/layout/DashboardContainer.jsx
import React from 'react';
import './DashboardContainer.css';

const DashboardContainer = ({ children, title, subtitle }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          {title && <h1 className="dashboard-title">{title}</h1>}
          {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="dashboard-content">{children}</div>
    </div>
  );
};

export default DashboardContainer;
