/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import {
  Snackbar,
  Alert as MuiAlert,
  IconButton,
  Box,
  Typography,
  Button,
  alpha,
  styled,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledSnackbar = styled(Snackbar)(({ theme, variant, severity }) => ({
  '& .MuiSnackbarContent-root': {
    borderRadius: theme.spacing(1),
    ...(variant === 'filled' && {
      backgroundColor:
        severity === 'success'
          ? theme.palette.success.main
          : severity === 'error'
            ? theme.palette.error.main
            : severity === 'warning'
              ? theme.palette.warning.main
              : theme.palette.info.main,
      color: theme.palette.getContrastText(
        severity === 'success'
          ? theme.palette.success.main
          : severity === 'error'
            ? theme.palette.error.main
            : severity === 'warning'
              ? theme.palette.warning.main
              : theme.palette.info.main
      ),
    }),
  },
}));

const Toast = ({
  // Core props
  open = false,
  message,
  severity = 'info',
  variant = 'standard', // 'standard' | 'filled' | 'outlined'

  // Position
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'left',
  },

  // Duration
  autoHideDuration = 5000,

  // Actions
  action,
  onClose,
  onUndo,
  undoable = false,

  // Progress
  showProgress = false,

  // Customization
  icon,
  title,

  // Multiple toasts
  id,

  // Callbacks
  onExited,

  ...props
}) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoHideDuration || !open || isPaused) return;

    const interval = 100; // Update every 100ms
    const step = (interval / autoHideDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoHideDuration, open, isPaused]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    onClose?.(event, reason);
  };

  const handleUndo = () => {
    onUndo?.();
    handleClose({}, 'undo');
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (severity) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const renderContent = () => {
    const alert = (
      <MuiAlert
        icon={getIcon()}
        severity={severity}
        variant={variant}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {undoable && (
              <Button
                color="inherit"
                size="small"
                onClick={handleUndo}
                startIcon={<UndoIcon />}
                sx={{ mr: 1 }}
              >
                Undo
              </Button>
            )}
            {action}
            <IconButton size="small" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{
          width: '100%',
          alignItems: 'center',
          '& .MuiAlert-message': {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          },
        }}
      >
        {title && (
          <Typography variant="subtitle2" component="div">
            {title}
          </Typography>
        )}
        <Typography variant="body2">{message}</Typography>
      </MuiAlert>
    );

    if (showProgress) {
      return (
        <Box sx={{ position: 'relative' }}>
          {alert}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: `${progress}%`,
              height: 3,
              backgroundColor: alpha(theme.palette.common.white, 0.3),
              transition: 'width 0.1s linear',
              borderBottomLeftRadius: theme.shape.borderRadius,
            }}
          />
        </Box>
      );
    }

    return alert;
  };

  return (
    <StyledSnackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
      TransitionComponent={motion.div}
      TransitionProps={{
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 },
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      {...props}
    >
      {renderContent()}
    </StyledSnackbar>
  );
};

// Toast container for multiple toasts
export const ToastContainer = ({ toasts = [], onClose }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: (theme) => theme.zIndex.snackbar,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <Toast open={true} onClose={() => onClose(toast.id)} {...toast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

// Toast hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((toast) => {
    const id = toast.id || Date.now();
    setToasts((prev) => [...prev, { ...toast, id, open: true }]);

    if (toast.autoHideDuration !== 0) {
      setTimeout(() => {
        hide(id);
      }, toast.autoHideDuration || 5000);
    }

    return id;
  }, []);

  const hide = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, options = {}) => {
      return show({ severity: 'success', message, ...options });
    },
    [show]
  );

  const error = useCallback(
    (message, options = {}) => {
      return show({ severity: 'error', message, ...options });
    },
    [show]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return show({ severity: 'warning', message, ...options });
    },
    [show]
  );

  const info = useCallback(
    (message, options = {}) => {
      return show({ severity: 'info', message, ...options });
    },
    [show]
  );

  return {
    toasts,
    show,
    hide,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onClose={hide} />,
  };
};

export default Toast;
