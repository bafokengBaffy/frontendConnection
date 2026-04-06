/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { sendEmailVerification, applyActionCode, checkActionCode } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';

import { auth } from '../../config/firebase';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const VerificationSteps = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have an oobCode for verification
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');
    const mode = queryParams.get('mode');

    if (oobCode && mode === 'verifyEmail') {
      handleVerification(oobCode);
    } else {
      // Get current user email
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email);
        // Check if already verified
        if (user.emailVerified) {
          setSuccess(true);
        }
      }
    }
  }, [location]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerification = async (oobCode) => {
    setVerifying(true);
    setError('');

    try {
      // Apply the email verification code
      await applyActionCode(auth, oobCode);

      // Reload user to get updated emailVerified status
      await auth.currentUser.reload();

      setSuccess(true);

      // Log successful verification
      console.log('Email verified successfully for:', auth.currentUser?.email);
    } catch (err) {
      console.error('Verification error:', err);

      try {
        // Check if the code is still valid
        await checkActionCode(auth, oobCode);
        setError('Failed to verify email. Please try again.');
      } catch (checkErr) {
        if (checkErr.code === 'auth/expired-action-code') {
          setError('The verification link has expired. Please request a new one.');
        } else if (checkErr.code === 'auth/invalid-action-code') {
          setError('The verification link is invalid. Please request a new one.');
        } else {
          setError('Failed to verify email. Please request a new verification link.');
        }
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSendVerification = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError('No user logged in');
      return;
    }

    if (user.emailVerified) {
      setSuccess(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/email-verified`,
        handleCodeInApp: true,
      });

      setEmailSent(true);
      setCountdown(60); // 60 second cooldown

      // Log verification email sent
      console.log('Verification email sent to:', user.email);
    } catch (err) {
      console.error('Send verification error:', err);

      switch (err.code) {
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('Failed to send verification email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);

    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setSuccess(true);
      }
    } catch (err) {
      setError('Failed to refresh status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (verifying) {
    return (
      <Container component="main" maxWidth="sm">
        <StyledPaper>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Verifying your email...
          </Typography>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {success ? (
            <MarkEmailReadIcon color="success" sx={{ fontSize: 64 }} />
          ) : (
            <EmailIcon color="primary" sx={{ fontSize: 64 }} />
          )}
        </Box>

        <Typography component="h1" variant="h4" gutterBottom fontWeight="600">
          {success ? 'Email Verified!' : 'Verify Your Email'}
        </Typography>

        {userEmail && !success && (
          <Typography variant="body1" color="text.secondary" align="center">
            We've sent a verification email to <strong>{userEmail}</strong>
          </Typography>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ width: '100%', mt: 2 }}
            onClose={() => setError('')}
            icon={<ErrorIcon />}
          >
            {error}
          </Alert>
        )}

        {success ? (
          <Fade in={success}>
            <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your email has been successfully verified!
              </Alert>

              <Typography variant="body2" paragraph>
                You now have full access to all features of your account.
              </Typography>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" onClick={() => navigate('/dashboard')} size="large">
                  Go to Dashboard
                </Button>

                <Button variant="outlined" onClick={() => navigate('/profile')}>
                  Complete Profile
                </Button>
              </Box>
            </Box>
          </Fade>
        ) : (
          <>
            <VerificationSteps>
              <Stepper orientation="vertical" activeStep={emailSent ? 1 : 0}>
                <Step>
                  <StepLabel>Check your inbox</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Look for an email from us in your inbox. It might take a few minutes to
                      arrive.
                    </Typography>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>Click the verification link</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Click the link in the email to verify your email address. This link expires in
                      24 hours.
                    </Typography>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>Return to this page</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      After clicking the link, return here and click "I've Verified" to continue.
                    </Typography>
                  </StepContent>
                </Step>
              </Stepper>
            </VerificationSteps>

            <Box sx={{ width: '100%', mt: 2 }}>
              {!emailSent ? (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSendVerification}
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Verification Email'}
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleRefreshStatus}
                  disabled={loading || countdown > 0}
                  startIcon={<RefreshIcon />}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : "I've Verified My Email"}
                </Button>
              )}

              {countdown > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                >
                  You can request another email in {countdown} seconds
                </Typography>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate(-1)}
                  sx={{ cursor: 'pointer' }}
                >
                  ← Go Back
                </Link>

                <Link
                  component="button"
                  variant="body2"
                  onClick={handleLogout}
                  sx={{ cursor: 'pointer' }}
                >
                  Logout
                </Link>
              </Box>
            </Box>

            {emailSent && (
              <Box sx={{ mt: 4, width: '100%', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Didn't receive the email?
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Check your spam or junk folder
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Make sure {userEmail} is the correct email address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  •{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleSendVerification}
                    disabled={countdown > 0}
                    sx={{ cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
                  >
                    Click here to resend verification email
                  </Link>
                </Typography>
              </Box>
            )}
          </>
        )}
      </StyledPaper>
    </Container>
  );
};

export default EmailVerification;
