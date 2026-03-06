import React from 'react';
import { Button as MuiButton, CircularProgress, alpha, styled } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Share as ShareIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

const StyledButton = styled(MuiButton)(({ theme, loading, fullWidth }) => ({
  position: 'relative',
  minWidth: fullWidth ? '100%' : 100,
  ...(loading === 'true' && {
    color: 'transparent !important',
    pointerEvents: 'none',
    '& .MuiCircularProgress-root': {
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginLeft: -12,
      marginTop: -12,
    },
  }),
  '&.MuiButton-contained': {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  },
  '&.MuiButton-outlined': {
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  '&.Mui-disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
}));

const Button = React.forwardRef(
  (
    {
      children,
      variant = 'contained',
      color = 'primary',
      size = 'medium',
      loading = false,
      disabled = false,
      fullWidth = false,
      startIcon,
      endIcon,
      onClick,
      type = 'button',
      href,
      target,
      rel,
      download,
      icon, // Predefined icon types
      ...props
    },
    ref
  ) => {
    const getIcon = (iconType) => {
      const iconProps = { fontSize: size === 'small' ? 'small' : 'medium' };

      switch (iconType) {
        case 'add':
          return <AddIcon {...iconProps} />;
        case 'edit':
          return <EditIcon {...iconProps} />;
        case 'delete':
          return <DeleteIcon {...iconProps} />;
        case 'save':
          return <SaveIcon {...iconProps} />;
        case 'download':
          return <DownloadIcon {...iconProps} />;
        case 'upload':
          return <UploadIcon {...iconProps} />;
        case 'search':
          return <SearchIcon {...iconProps} />;
        case 'filter':
          return <FilterIcon {...iconProps} />;
        case 'refresh':
          return <RefreshIcon {...iconProps} />;
        case 'close':
          return <CloseIcon {...iconProps} />;
        case 'check':
          return <CheckIcon {...iconProps} />;
        case 'next':
          return <ArrowForwardIcon {...iconProps} />;
        case 'back':
          return <ArrowBackIcon {...iconProps} />;
        case 'share':
          return <ShareIcon {...iconProps} />;
        case 'print':
          return <PrintIcon {...iconProps} />;
        case 'more':
          return <MoreIcon {...iconProps} />;
        default:
          return null;
      }
    };

    const finalStartIcon = icon && !startIcon ? getIcon(icon) : startIcon;
    const finalEndIcon = icon && !endIcon ? getIcon(icon) : endIcon;

    return (
      <StyledButton
        ref={ref}
        variant={variant}
        color={color}
        size={size}
        disabled={disabled || loading}
        loading={loading.toString()}
        fullWidth={fullWidth}
        startIcon={!loading && finalStartIcon}
        endIcon={!loading && finalEndIcon}
        onClick={onClick}
        type={type}
        href={href}
        target={target}
        rel={rel}
        download={download}
        {...props}
      >
        {children}
        {loading && <CircularProgress size={24} color="inherit" />}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

// Pre-configured button variants
export const PrimaryButton = (props) => <Button variant="contained" color="primary" {...props} />;

export const SecondaryButton = (props) => (
  <Button variant="contained" color="secondary" {...props} />
);

export const OutlineButton = (props) => <Button variant="outlined" color="primary" {...props} />;

export const TextButton = (props) => <Button variant="text" color="primary" {...props} />;

export const DangerButton = (props) => <Button variant="contained" color="error" {...props} />;

export const SuccessButton = (props) => <Button variant="contained" color="success" {...props} />;

export const IconButton = React.forwardRef(({ icon, tooltip, ...props }, ref) => (
  <MuiButton
    ref={ref}
    variant="text"
    sx={{
      minWidth: 'auto',
      p: 1,
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: alpha(props.color || 'primary', 0.04),
      },
    }}
    {...props}
  >
    {icon}
  </MuiButton>
));

IconButton.displayName = 'IconButton';

export default Button;
