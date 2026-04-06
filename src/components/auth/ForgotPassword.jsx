/* eslint-disable no-unused-vars */
import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^.@]+@[^.@]+.[^.@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);

      // Clear form
      setEmail('');

      // Log the password reset request (for audit purposes)
      console.log('Password reset email sent to:', email);
    } catch (err) {
      console.error('Password reset error:', err);

      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email && success) {
      setError('Please enter your email address');
      return;
    }
    await handleSubmit({ preventDefault: () => {} });
  };

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper>
        <Typography component="h1" variant="h4" gutterBottom fontWeight="600">
          Reset Password
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset email sent successfully!
            </Alert>

            <Typography variant="body2" paragraph>
              We've sent an email to <strong>{email}</strong> with instructions to reset your
              password.
            </Typography>

            <Typography variant="body2" paragraph color="text.secondary">
              Didn't receive the email? Check your spam folder or{' '}
              <Link
                component="button"
                variant="body2"
                onClick={handleResend}
                disabled={loading}
                sx={{ cursor: 'pointer' }}
              >
                click here to resend
              </Link>
            </Typography>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>

              <Button variant="contained" component={RouterLink} to="/login">
                Continue to Login
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors({ ...fieldErrors, email: '' });
              }}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
                sx={{ cursor: 'pointer' }}
              >
                ← Back to Login
              </Link>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 4, width: '100%' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            For security reasons, password reset links expire after 1 hour.
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default ForgotPassword;
