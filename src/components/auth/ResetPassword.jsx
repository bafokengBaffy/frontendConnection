/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
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

const PasswordStrengthBar = styled(LinearProgress)(({ theme, strength }) => ({
  height: 8,
  borderRadius: 4,
  marginTop: theme.spacing(1),
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    backgroundColor:
      strength === 'weak'
        ? theme.palette.error.main
        : strength === 'medium'
          ? theme.palette.warning.main
          : strength === 'strong'
            ? theme.palette.success.main
            : theme.palette.primary.main,
  },
}));

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Get the oobCode (one-time code) from URL
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get('oobCode');
  const mode = queryParams.get('mode');

  useEffect(() => {
    verifyCode();
  }, [oobCode]);

  const verifyCode = async () => {
    if (!oobCode || mode !== 'resetPassword') {
      setError('Invalid or missing reset code');
      setVerifying(false);
      return;
    }

    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      setEmail(email);
      setVerifying(false);
    } catch (err) {
      console.error('Code verification error:', err);

      switch (err.code) {
        case 'auth/expired-action-code':
          setError('The reset link has expired. Please request a new one.');
          break;
        case 'auth/invalid-action-code':
          setError('The reset link is invalid. Please request a new one.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/user-not-found':
          setError('No account found for this reset link.');
          break;
        default:
          setError('Failed to verify reset code. Please try again.');
      }

      setVerifying(false);
    }
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('One special character (!@#$%^&*)');
    }

    return errors;
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return '';

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  const validateForm = () => {
    const errors = {};
    const passwordErrors = validatePassword(newPassword);

    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else if (passwordErrors.length > 0) {
      errors.newPassword = passwordErrors.join(', ');
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));

    // Clear field error
    setFieldErrors({ ...fieldErrors, newPassword: '' });

    // Check if passwords match
    if (confirmPassword && password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);

      // Log successful password reset (for audit)
      console.log('Password reset successful for:', email);
    } catch (err) {
      console.error('Password reset error:', err);

      switch (err.code) {
        case 'auth/expired-action-code':
          setError('The reset link has expired. Please request a new one.');
          break;
        case 'auth/invalid-action-code':
          setError('The reset link is invalid. Please request a new one.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        default:
          setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Container component="main" maxWidth="sm">
        <StyledPaper>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Verifying reset link...
          </Typography>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper>
        <Typography component="h1" variant="h4" gutterBottom fontWeight="600">
          {success ? 'Password Reset Complete' : 'Create New Password'}
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ width: '100%', mb: 2 }}
            onClose={() => setError('')}
            icon={<ErrorIcon />}
          >
            {error}
          </Alert>
        )}

        {success ? (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />

            <Alert severity="success" sx={{ mb: 3 }}>
              Your password has been successfully reset!
            </Alert>

            <Typography variant="body2" paragraph>
              You can now log in with your new password.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ px: 4 }}
              >
                Go to Login
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {email && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Resetting password for: <strong>{email}</strong>
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={handlePasswordChange}
              error={!!fieldErrors.newPassword}
              helperText={fieldErrors.newPassword}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {newPassword && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Password Strength: {passwordStrength}
                </Typography>
                <PasswordStrengthBar
                  variant="determinate"
                  value={
                    passwordStrength === 'weak'
                      ? 33
                      : passwordStrength === 'medium'
                        ? 66
                        : passwordStrength === 'strong'
                          ? 100
                          : 0
                  }
                  strength={passwordStrength}
                />
              </Box>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors({ ...fieldErrors, confirmPassword: '' });
              }}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
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
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
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
      </StyledPaper>
    </Container>
  );
};

export default ResetPassword;
