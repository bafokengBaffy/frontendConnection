import React from 'react';
import { Box, alpha, styled, useTheme } from '@mui/material';
import * as Icons from '@mui/icons-material';

const IconWrapper = styled(Box)(({ theme, size, color, background, rounded, clickable }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(background && {
    backgroundColor: alpha(theme.palette[color]?.main || color, 0.1),
    padding: theme.spacing(1),
  }),
  ...(rounded && {
    borderRadius: rounded === 'circle' ? '50%' : theme.shape.borderRadius,
  }),
  ...(clickable && {
    cursor: 'pointer',
    transition: theme.transitions.create(['background-color', 'transform']),
    '&:hover': {
      transform: 'scale(1.1)',
      backgroundColor: background ? alpha(theme.palette[color]?.main || color, 0.2) : 'transparent',
    },
  }),
  ...(size === 'small' && {
    '& svg': {
      fontSize: '1.25rem',
    },
  }),
  ...(size === 'medium' && {
    '& svg': {
      fontSize: '1.5rem',
    },
  }),
  ...(size === 'large' && {
    '& svg': {
      fontSize: '2rem',
    },
  }),
  ...(size === 'xlarge' && {
    '& svg': {
      fontSize: '3rem',
    },
  }),
}));

const Icon = ({
  // Core props
  name,

  // Size
  size = 'medium',

  // Color
  color = 'inherit',

  // Background
  background = false,
  rounded = false,

  // Features
  spin = false,
  pulse = false,
  clickable = false,

  // Events
  onClick,

  // Custom SVG
  component: CustomComponent,

  ...props
}) => {
  const theme = useTheme();

  const getIconColor = () => {
    if (color === 'inherit') return 'inherit';
    return theme.palette[color]?.main || color;
  };

  const renderIcon = () => {
    if (CustomComponent) {
      return <CustomComponent />;
    }

    const MuiIcon = Icons[name];
    if (!MuiIcon) {
      console.warn(`Icon "${name}" not found in @mui/icons-material`);
      return null;
    }

    return <MuiIcon />;
  };

  const iconStyles = {
    animation: spin
      ? 'spin 2s linear infinite'
      : pulse
        ? 'pulse 1.5s ease-in-out infinite'
        : 'none',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    '@keyframes pulse': {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.5 },
      '100%': { opacity: 1 },
    },
  };

  return (
    <IconWrapper
      size={size}
      color={color}
      background={background}
      rounded={rounded}
      clickable={clickable}
      onClick={onClick}
      sx={{
        color: getIconColor(),
        ...iconStyles,
        ...props.sx,
      }}
      {...props}
    >
      {renderIcon()}
    </IconWrapper>
  );
};

// Pre-configured icons
export const LoadingIcon = (props) => <Icon name="Refresh" spin size="medium" {...props} />;

export const SuccessIcon = (props) => (
  <Icon name="CheckCircle" color="success" size="medium" {...props} />
);

export const ErrorIcon = (props) => <Icon name="Error" color="error" size="medium" {...props} />;

export const WarningIcon = (props) => (
  <Icon name="Warning" color="warning" size="medium" {...props} />
);

export const InfoIcon = (props) => <Icon name="Info" color="info" size="medium" {...props} />;

// Helper to get icon by name
export const getIcon = (name, props = {}) => {
  const MuiIcon = Icons[name];
  if (!MuiIcon) return null;
  return <MuiIcon {...props} />;
};

export default Icon;
