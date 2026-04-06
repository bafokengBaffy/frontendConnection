/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Alert as MuiAlert,
  AlertTitle,
  Box,
  IconButton,
  Collapse,
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
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledAlert = styled(MuiAlert)(({ theme, severity, variant, customcolor }) => {
  const getColor = () => {
    if (customcolor) return customcolor;
    switch (severity) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const color = getColor();

  return {
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1, 2),
    ...(variant === 'outlined' && {
      border: `1px solid ${color}`,
      backgroundColor: 'transparent',
      color: color,
    }),
    ...(variant === 'filled' && {
      backgroundColor: color,
      color: theme.palette.getContrastText(color),
      '& .MuiAlert-icon': {
        color: theme.palette.getContrastText(color),
      },
    }),
    ...(variant === 'standard' && {
      backgroundColor: alpha(color, 0.08),
      color: theme.palette.text.primary,
    }),
  };
});

const Alert = ({
  // Core props
  children,
  title,
  severity = 'info',
  variant = 'standard',

  // Features
  closable = false,
  collapsible = false,
  actions = [],
  icon,

  // State
  open = true,
  onClose,

  // Animation
  animated = true,

  // Customization
  rounded = true,
  elevation = 0,

  // Callbacks
  onAction,

  ...props
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(open);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleAction = (action) => {
    action.onClick?.();
    onAction?.(action);
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
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const alertContent = (
    <StyledAlert
      severity={severity}
      variant={variant}
      icon={getIcon()}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Custom Actions */}
          {actions.map((action, index) => (
            <IconButton
              key={index}
              size="small"
              onClick={() => handleAction(action)}
              sx={{
                color: variant === 'filled' ? 'inherit' : action.color || severity,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              {action.icon}
            </IconButton>
          ))}

          {/* Close Button */}
          {closable && (
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: variant === 'filled' ? 'inherit' : theme.palette.text.secondary,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      }
      sx={{
        borderRadius: rounded ? theme.shape.borderRadius : 0,
        boxShadow: elevation ? theme.shadows[elevation] : 'none',
        cursor: collapsible ? 'pointer' : 'default',
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
      onClick={() => collapsible && setCollapsed(!collapsed)}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}

      <AnimatePresence initial={false}>
        {(!collapsible || !collapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </StyledAlert>
  );

  return animated ? <Collapse in={isOpen}>{alertContent}</Collapse> : isOpen && alertContent;
};

// Pre-configured alert types
export const SuccessAlert = (props) => <Alert severity="success" variant="filled" {...props} />;

export const ErrorAlert = (props) => <Alert severity="error" variant="filled" {...props} />;

export const WarningAlert = (props) => <Alert severity="warning" variant="filled" {...props} />;

export const InfoAlert = (props) => <Alert severity="info" variant="filled" {...props} />;

export default Alert;
