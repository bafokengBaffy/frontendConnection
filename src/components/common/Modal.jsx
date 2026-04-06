/* eslint-disable no-undef */
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';

import Button from './Button';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledDialog = styled(Dialog)(({ theme, fullscreen }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: fullscreen ? '100%' : 400,
    maxWidth: fullscreen ? '100%' : 800,
    height: fullscreen ? '100%' : 'auto',
    margin: fullscreen ? 0 : theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      minWidth: '90%',
      margin: theme.spacing(1),
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:first-of-type': {
    paddingTop: theme.spacing(3),
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(1),
}));

const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true,
  fullScreen = false,
  showCloseIcon = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  disablePortal = false,
  keepMounted = false,
  scroll = 'paper',
  dividers = false,
  transitionDuration = 300,
  size, // 'sm', 'md', 'lg', 'xl'
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isFullScreen, setIsFullScreen] = React.useState(fullScreen || isMobile);

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' && !closeOnBackdropClick) return;
    if (reason === 'escapeKeyDown' && !closeOnEscape) return;
    onClose?.(event, reason);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && closeOnEscape && open) {
        onClose?.(event, 'escapeKeyDown');
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeOnEscape, onClose, open]);

  const getMaxWidth = () => {
    if (size) {
      const sizeMap = {
        sm: 400,
        md: 600,
        lg: 900,
        xl: 1200,
      };
      return sizeMap[size] || 600;
    }
    return maxWidth;
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      transitionDuration={transitionDuration}
      fullScreen={isFullScreen}
      fullWidth={fullWidth}
      maxWidth={isFullScreen ? false : getMaxWidth()}
      disablePortal={disablePortal}
      keepMounted={keepMounted}
      scroll={scroll}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      {...props}
    >
      <StyledDialogTitle id="modal-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {typeof title === 'string' ? (
            <Typography variant="h6" component="span" fontWeight="600">
              {title}
            </Typography>
          ) : (
            title
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!fullScreen && !isMobile && (
            <IconButton
              size="small"
              onClick={toggleFullScreen}
              aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
            >
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          )}

          {showCloseIcon && (
            <IconButton
              size="small"
              onClick={(e) => onClose?.(e, 'closeButtonClick')}
              aria-label="Close modal"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </StyledDialogTitle>

      <StyledDialogContent id="modal-description" dividers={dividers}>
        {children}
      </StyledDialogContent>

      {actions && (
        <StyledDialogActions>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'text'}
              color={action.color || 'primary'}
              onClick={action.onClick}
              loading={action.loading}
              disabled={action.disabled}
              startIcon={action.startIcon}
              endIcon={action.endIcon}
              size={action.size || 'medium'}
              fullWidth={action.fullWidth}
            >
              {action.label}
            </Button>
          ))}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

// Confirmation Modal
export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  confirmVariant = 'contained',
  loading = false,
  ...props
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      actions={[
        {
          label: cancelText,
          variant: 'outlined',
          onClick: onClose,
          disabled: loading,
        },
        {
          label: confirmText,
          variant: confirmVariant,
          color: confirmColor,
          onClick: onConfirm,
          loading: loading,
        },
      ]}
      {...props}
    >
      <Typography>{message}</Typography>
    </Modal>
  );
};

export default Modal;
