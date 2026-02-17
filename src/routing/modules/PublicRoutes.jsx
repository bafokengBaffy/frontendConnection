import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy loaded public components
const Home = lazy(() => import('../../pages/Home')); // ADD THIS LINE
const Login = lazy(() => import('../../pages/auth/Login'));
const Register = lazy(() => import('../../pages/auth/Register'));
const Resources = lazy(() => import('../../pages/Resources/Resources'));

/**
 * Public Routes Module
 * Contains all public accessible routes (no authentication required)
 */
export const getPublicRoutes = () => [
  <Route key="home" path="/" element={<Home />} />, // ADD THIS LINE
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="register" path="/register" element={<Register />} />,
  <Route key="resources" path="/resources" element={<Resources />} />
];