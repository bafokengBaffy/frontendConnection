import React from 'react';

const LoadingSpinner = ({ message = "Loading...", size = "lg" }) => {
  const spinnerSize = {
    sm: { width: '1.5rem', height: '1.5rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="text-center">
        <div 
          className="spinner-border text-primary" 
          role="status" 
          style={spinnerSize[size]}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && <p className="mt-3 text-muted">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;