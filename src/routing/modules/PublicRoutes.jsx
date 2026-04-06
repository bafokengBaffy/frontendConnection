import React from 'react';
import { Navigate, Route } from 'react-router-dom';

// Lazy load public pages
const Home = React.lazy(() => import('../../pages/Home'));
const Login = React.lazy(() => import('../../pages/auth/Login'));
const Register = React.lazy(() => import('../../pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('../../components/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../../components/auth/ResetPassword'));
const About = React.lazy(() => import('../../pages/common/About'));
const Contact = React.lazy(() => import('../../pages/common/Contact'));
const FAQ = React.lazy(() => import('../../pages/common/FAQ'));
const PrivacyPolicy = React.lazy(() => import('../../pages/common/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('../../pages/common/TermsOfService'));

export const getPublicRoutes = () => (
  <React.Fragment>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </React.Fragment>
);

export default getPublicRoutes;
