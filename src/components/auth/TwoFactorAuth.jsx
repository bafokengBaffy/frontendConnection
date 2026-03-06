import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Link,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { auth } from '../../config/firebase';
import {
  Phone as PhoneIcon,
  Smartphone as SmartphoneIcon,
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import * as speakeasy from 'speakeasy';
import { MultiFactorAuth, TotpMultiFactorGenerator, TotpSecret } from 'firebase/auth';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const QRContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  display: 'inline-block',
}));

const BackupCodeContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const BackupCode = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  fontFamily: 'monospace',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const TwoFactorAuth = () => {
  const [loading, setLoading] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2FA Setup states
  const [setupStep, setSetupStep] = useState(0); // 0: not started, 1: QR code, 2: verify, 3: backup codes
  const [secret, setSecret] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Multi-factor info
  const [multiFactorSession, setMultiFactorSession] = useState(null);
  const [enrolledFactors, setEnrolledFactors] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    factorId: null,
  });

  useEffect(() => {
    loadMultiFactorInfo();
  }, []);

  const loadMultiFactorInfo = async () => {
    const user = auth.currentUser;
    if (user) {
      const multiFactorUser = MultiFactorAuth(user);
      setEnrolledFactors(multiFactorUser.enrolledFactors || []);
    }
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    return codes;
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      const multiFactorUser = MultiFactorAuth(user);

      // Create a multi-factor session
      const session = await multiFactorUser.getSession();
      setMultiFactorSession(session);

      // Generate a TOTP secret
      const totpSecret = await TotpSecret.create();
      setSecret(totpSecret);

      // Generate QR code URL
      const otpAuthUrl = totpSecret.generateQrCodeUrl(user.email, 'Your App Name');
      setQrCodeUrl(otpAuthUrl);

      // Move to QR code step
      setSetupStep(1);
    } catch (err) {
      console.error('Enable 2FA error:', err);
      setError('Failed to start 2FA setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setEnabling(true);
    setError('');

    try {
      const user = auth.currentUser;
      const multiFactorUser = MultiFactorAuth(user);

      // Verify the code
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(
        secret.secret,
        verificationCode
      );

      // Enroll the factor
      await multiFactorUser.enroll(assertion, 'Authenticator App');

      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Move to backup codes step
      setSetupStep(3);

      // Refresh enrolled factors
      await loadMultiFactorInfo();
    } catch (err) {
      console.error('Verification error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please try again.');
      } else {
        setError('Failed to verify code. Please try again.');
      }
    } finally {
      setEnabling(false);
    }
  };

  const handleDisable2FA = async (factorId) => {
    setDisabling(true);
    setError('');

    try {
      const user = auth.currentUser;
      const multiFactorUser = MultiFactorAuth(user);

      await multiFactorUser.unenroll(factorId);

      setSuccess('Two-factor authentication has been disabled.');
      setConfirmDialog({ open: false, factorId: null });

      // Reset setup state
      setSetupStep(0);
      setSecret(null);
      setQrCodeUrl('');
      setVerificationCode('');
      setBackupCodes([]);

      // Refresh enrolled factors
      await loadMultiFactorInfo();
    } catch (err) {
      console.error('Disable 2FA error:', err);
      setError('Failed to disable two-factor authentication.');
    } finally {
      setDisabling(false);
    }
  };

  const handleCompleteSetup = () => {
    setSetupStep(0);
    setShowBackupCodes(false);
    setSuccess('Two-factor authentication has been enabled successfully!');
  };

  const handleResendSMS = async () => {
    // Implement SMS resend logic if using SMS 2FA
  };

  const handleFactorDeleteClick = (factorId) => {
    setConfirmDialog({
      open: true,
      factorId,
    });
  };

  return (
    <Container component="main" maxWidth="md">
      <StyledPaper>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, width: '100%' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="600">
            Two-Factor Authentication (2FA)
          </Typography>
        </Box>

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

        {success && (
          <Alert
            severity="success"
            sx={{ width: '100%', mb: 2 }}
            onClose={() => setSuccess('')}
            icon={<CheckCircleIcon />}
          >
            {success}
          </Alert>
        )}

        {/* Current 2FA Status */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {enrolledFactors.length > 0 ? (
                <>
                  <VerifiedUserIcon color="success" sx={{ mr: 1 }} />
                  <Typography>
                    Two-factor authentication is <strong>enabled</strong>
                  </Typography>
                </>
              ) : (
                <>
                  <SecurityIcon color="action" sx={{ mr: 1 }} />
                  <Typography>
                    Two-factor authentication is <strong>disabled</strong>
                  </Typography>
                </>
              )}
            </Box>

            {enrolledFactors.length > 0 && (
              <List>
                {enrolledFactors.map((factor) => (
                  <ListItem key={factor.uid}>
                    <ListItemIcon>
                      <SmartphoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={factor.displayName || 'Authenticator App'}
                      secondary={`Added on ${new Date(factor.enrollmentTime).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleFactorDeleteClick(factor.uid)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>

        {/* Setup Flow */}
        {enrolledFactors.length === 0 && setupStep === 0 && (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Why enable 2FA?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Two-factor authentication adds an extra layer of security to your account by requiring
              a verification code in addition to your password when signing in.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleEnable2FA}
              disabled={loading}
              startIcon={<SecurityIcon />}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Enable Two-Factor Authentication'}
            </Button>
          </Box>
        )}

        {/* QR Code Step */}
        {setupStep === 1 && secret && (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Scan QR Code
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Typography>

            <QRContainer>
              <QRCodeCanvas value={qrCodeUrl} size={200} />
            </QRContainer>

            <Typography variant="body2" paragraph>
              Can't scan the code? Enter this secret manually:
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography fontFamily="monospace" fontSize="1.2rem">
                {secret.secret}
              </Typography>
            </Paper>

            <Button variant="contained" onClick={() => setSetupStep(2)} sx={{ mt: 2 }}>
              Next: Verify Code
            </Button>
          </Box>
        )}

        {/* Verification Step */}
        {setupStep === 2 && (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Verify Setup
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Enter the 6-digit code from your authenticator app to verify the setup.
            </Typography>

            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setSetupStep(1)}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleVerifyCode}
                disabled={enabling || verificationCode.length !== 6}
              >
                {enabling ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Backup Codes Step */}
        {setupStep === 3 && backupCodes.length > 0 && (
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom color="error">
              Save Your Backup Codes
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              Store these backup codes in a safe place. You'll need them if you lose access to your
              authenticator app. Each code can only be used once.
            </Alert>

            <BackupCodeContainer>
              {backupCodes.map((code, index) => (
                <BackupCode key={index} elevation={0}>
                  {code.match(/.{1,4}/g).join('-')}
                </BackupCode>
              ))}
            </BackupCodeContainer>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => {
                  const text = backupCodes.join('\n');
                  navigator.clipboard.writeText(text);
                }}
              >
                Copy Codes
              </Button>
              <Button variant="contained" color="primary" onClick={handleCompleteSetup}>
                I've Saved Codes
              </Button>
            </Box>
          </Box>
        )}

        {/* SMS 2FA Option (if needed) */}
        <Divider sx={{ width: '100%', my: 4 }}>
          <Chip label="Alternative Methods" />
        </Divider>

        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            You can also set up SMS-based two-factor authentication:
          </Typography>

          <FormControlLabel control={<Switch />} label="Receive codes via SMS" />

          <TextField fullWidth label="Phone Number" placeholder="+1234567890" sx={{ mt: 2 }} />

          <Button variant="outlined" onClick={handleResendSMS} sx={{ mt: 2 }}>
            Send Test Code
          </Button>
        </Box>
      </StyledPaper>

      {/* Confirmation Dialog for disabling 2FA */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, factorId: null })}
      >
        <DialogTitle>Disable Two-Factor Authentication?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove the extra security layer from your account. Are you sure you want to
            continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, factorId: null })}>Cancel</Button>
          <Button
            onClick={() => handleDisable2FA(confirmDialog.factorId)}
            color="error"
            disabled={disabling}
          >
            {disabling ? <CircularProgress size={24} /> : 'Disable'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TwoFactorAuth;
