// src/components/layout/DashboardRedirect.js - COMPLETELY FIXED VERSION
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const DashboardRedirect = () => {
  const { userProfile, currentUser, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading...</span>
      </div>
    );
  }

  // If no user is authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Wait for userProfile to load
  if (!userProfile) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="info" />
        <span className="ms-3">Loading your dashboard...</span>
      </div>
    );
  }

  // **CRITICAL FIX: Use userProfile.userType for redirect**
  const userType = userProfile?.userType || 'student';
  
  console.log(`🎯 DashboardRedirect: Redirecting ${userType} user`);

  switch (userType) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'youth':
      return <Navigate to="/youth/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'company':
      return <Navigate to="/company/dashboard" replace />;
    case 'entrepreneur':
      return <Navigate to="/entrepreneur/dashboard" replace />;
    case 'institute':
      return <Navigate to="/institute/dashboard" replace />;
    case 'employer':
      return <Navigate to="/employer/dashboard" replace />;
    default:
      console.warn(`⚠️ Unknown user type: ${userType}, redirecting to student dashboard`);
      return <Navigate to="/student/dashboard" replace />;
  }
};

export default DashboardRedirect;